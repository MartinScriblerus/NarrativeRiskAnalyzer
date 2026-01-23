import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../database/entities/team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalCacheService } from '../../cache/cache.service';
import { PinoLogger } from 'nestjs-pino';
import { CreateTeamDto } from './dto/create-team.dto';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { TeamPokemonEntity } from '../../database/entities/team-pokemon.entity';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { verifyToken } from '../../../utils/profileToken'
@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
    @InjectRepository(TeamPokemonEntity)
    private readonly teamPokemonRepo: Repository<TeamPokemonEntity>,
    private readonly cache: LocalCacheService,
    private readonly logger: PinoLogger
  ) {}

  async getAllTeams(topN?: number) {
    const qb = this.teamRepo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.profile', 'profile')
      // .where('team.persistent = false OR team.persistent = true AND team.profileId IS NOT NULL')
      .orderBy('team.selectedCount', 'DESC')
      .addOrderBy('team.createdAt', 'DESC')
      // .take(topN)
      .select([
        'team.id',
        'team.name',
        'team.selectedCount',
        'team.createdAt',
        // 'team.persistent',
        'profile.id',
        'profile.name',
      ])

      if (topN && typeof topN === 'number') qb.take(topN);

      return qb.getMany();
  }

  async getTeam(teamId: string): Promise<TeamEntity | null> {
    const cacheKey = `team:${teamId}`;
    const cached = this.cache.get<TeamEntity>(cacheKey);
    if (cached) return cached;

    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }
    if (team) this.cache.set(cacheKey, team, 2 * 60 * 60 * 1000); // 2 hr TTL
    return team;
  }

  /**
   * Record a team selection event:
   * - Increments team.selectedCount (atomic)
   * - Increments selectedCount on each Pokemon that belongs to the team
   *
   * Returns:
   * - true: selection recorded
   * - false: invalid input or failure to record
   *
   * Notes:
   * - Does not throw for invalid teamId; logs errors and returns false on error.
   */
  async recordTeamSelection(teamId: string): Promise<boolean> {
    if (!teamId) return false;

    try {
      const team = await this.teamRepo.findOne({
        where: { id: teamId },
        relations: ['teamPokemons', 'teamPokemons.pokemon'],
      });

      if (!team) {
        // invalid selection — do not throw, just return false
        return false;
      }

      // Atomically increment the team's selectedCount
      await this.teamRepo.increment({ id: teamId }, 'selectedCount', 1);

      // Increment each pokemon's selectedCount (if any)
      const pokemonIds = (team.teamPokemons ?? [])
        .map((tp) => tp.pokemon?.id)
        .filter(Boolean) as string[];

      if (pokemonIds.length > 0) {
        // Use the teamRepo.manager to get a Pokemon repository dynamically
        const pokemonRepo = this.teamRepo.manager.getRepository(PokemonEntity);
        await Promise.all(
          pokemonIds.map((pid) => pokemonRepo.increment({ id: pid }, 'selectedCount', 1))
        );
      }

      return true;
    } catch (err) {
      // Log and return false — do not bubble errors to callers
      try {
        this.logger.error({ err, teamId }, 'recordTeamSelection failed');
      } catch (e) {
        // swallow logger errors
        // eslint-disable-next-line no-console
        console.error('recordTeamSelection error', err);
      }
      return false;
    }
  }

  async createTeam(dto: CreateTeamDto): Promise<TeamEntity> {
    // Defensive server-side enforcement: reject >6 pokemon even if the client sends them.
    const incomingPokemonIds = (dto as any).pokemonIds;
    if (incomingPokemonIds !== undefined) {
      if (!Array.isArray(incomingPokemonIds)) {
        throw new BadRequestException('pokemonIds must be an array of pokemon IDs');
      }
      if (incomingPokemonIds.length > 6) {
        throw new BadRequestException('A team may contain at most 6 pokemon');
      }
    } else {
      throw new BadRequestException('A team must contain at least 1 pokemon');
    }

    const profile = await this.profileRepo.findOne({
      where: { id: dto.profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${dto.profileId} not found`);
    }

    // Create the team entity, then explicitly assign the profile entity.
    const team = this.teamRepo.create({
      name: dto.name,
    });

    // Explicit relation assignment (helps TypeORM set FK reliably)
    team.profile = profile;

    // Defensive: set the FK property directly to guarantee it's present on the insert
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    team['profileId'] = profile.id;

    console.log(
      '[TeamsService] before save - team.payload:',
      { name: team.name, profileId: (team as any).profileId, profileInstance: team.profile?.id }
    );

    let saved: TeamEntity;
    try {
      saved = await this.teamRepo.save(team);
    } catch (err) {
      this.logger.error(
        { err, dto: { name: dto.name, profileId: dto.profileId }, team: { name: team.name, profileId: (team as any).profileId } },
        'TeamsService.createTeam: failed to save team'
      );

      // Extra console output that won't be swallowed by structured logging
      console.error('[TeamsService] createTeam SAVE ERROR', {
        err: err?.stack ?? err,
        dto: { name: dto.name, profileId: dto.profileId },
        team: { name: team.name, profileId: (team as any).profileId },
        profileId: profile?.id,
      });

      throw err; // rethrow so Nest still responds with 500 (or you can wrap in a more friendly HttpException)
    }
    console.log('[TeamsService] saved team:', { id: saved.id, profileId: (saved as any).profileId ?? saved.profile?.id });

    // If the caller provided pokemonIds, persist team_pokemons rows
    const pokemonIds = (dto as any).pokemonIds ?? [];
    if (Array.isArray(pokemonIds) && pokemonIds.length > 0) {
      const teamPokemonRows = pokemonIds.map((pid: string) =>
        this.teamPokemonRepo.create({
          team: { id: saved.id } as any,
          pokemon: { id: pid } as any,
        })
      );
      try {
        await this.teamPokemonRepo.save(teamPokemonRows);
        this.logger.info({ teamId: saved.id, count: teamPokemonRows.length }, 'Saved team-pokemon rows');
        console.log('[TeamsService] persisted teamPokemons for team:', saved.id, teamPokemonRows.map(r => (r as any).pokemon?.id ?? (r as any).pokemon));
      } catch (err) {
        this.logger.error({ err, teamId: saved.id }, 'Failed to persist team-pokemon rows');
        console.error('[TeamsService] error saving teamPokemons', { err, teamId: saved.id });
        // optionally rethrow or continue; we'll continue so the team exists even if pokemon rows fail
      }

      // invalidate any caches that depend on team-pokemons
      this.cache.delete(`team:${saved.id}`);
      this.cache.delete(`profile:${dto.profileId}:teams`);
    }

    // After persisting team-pokemon rows (if any), reload the team with relations
    const reloaded = await this.teamRepo.findOne({
      where: { id: saved.id },
      relations: ['teamPokemons', 'teamPokemons.pokemon'],
    });

    // Cache the team for quick reads
    if (reloaded) {
      this.cache.set(`team:${saved.id}`, reloaded, 2 * 60 * 60 * 1000);
      // Also already invalidated profile cache above
      return reloaded;
    }

    // Fallback to the saved team (no relations available)
    return saved;
  }

  async updateTeam(teamId: string, update: Partial<TeamEntity>): Promise<TeamEntity> {
    await this.teamRepo.update(teamId, update);

    // invalidate stale cache
    this.cache.delete(`team:${teamId}`);

    const updated = await this.getTeam(teamId); // refresh cache
    return updated!;
  }

  // delete a team by id (used for quick testing)
  async deleteTeam(teamId: string): Promise<{ deleted: boolean; teamId: string }> {
    const team = await this.teamRepo.findOne({ where: { id: teamId }, relations: ['profile'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    await this.teamRepo.remove(team);

    // invalidate caches
    this.cache.delete(`team:${teamId}`);
    if (team.profile?.id) {
      this.cache.delete(`profile:${team.profile.id}:teams`);
      this.cache.delete('allProfiles');
    }

    this.logger.info({ teamId }, 'Deleted team');
    return { deleted: true, teamId };
  }

  // return human-readable Pokemon names for a team
  async getPokemonNamesForTeam(teamId: string): Promise<string[]> {
    // Load team with nested relations to get pokemon names
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['teamPokemons', 'teamPokemons.pokemon'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const names = (team.teamPokemons ?? []).map((tp) => tp.pokemon?.name).filter(Boolean);
    return names;
  }
}
