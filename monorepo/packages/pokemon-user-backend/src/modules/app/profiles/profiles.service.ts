import { InjectRepository } from "@nestjs/typeorm";
import { ProfileEntity } from "../../database/entities/profile.entity";
import { Repository } from "typeorm";
import { LocalCacheService } from "../../cache";
import { PinoLogger } from "nestjs-pino";
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { TeamEntity } from "../../database/entities/team.entity";
import { signPayload } from '../../../utils/profileToken';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
    private readonly cache: LocalCacheService,
    private readonly logger: PinoLogger
  ) {}

  async getTeams(profileId: string): Promise<TeamEntity[]> {
    const cacheKey = `profile:${profileId}:teams`;
    const TTL_2_HOURS = 2 * 60 * 60 * 1000; // 7_200_000 ms

    const cached = this.cache.get<TeamEntity[]>(cacheKey);
    if (cached) {
      this.logger.info({ profileId }, 'Cache HIT for profile teams');
      return cached;
    }

    this.logger.info({ profileId }, 'Cache MISS for profile teams');

    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
      relations: ['createdTeams', 'createdTeams.teamPokemons', 'createdTeams.teamPokemons.pokemon'],
    });

    const teams = profile?.createdTeams ?? [];

    // cache ephemeral teams for 2 hours
    // Cache result with 2-hour TTL
    this.cache.set(cacheKey, teams, TTL_2_HOURS);
    this.logger.info({ profileId, ttl: TTL_2_HOURS }, 'Cached profile teams for 2 hours');

    return teams;
  }
  
  async getAllProfiles() {
    const cacheKey = 'allProfiles';
    const TTL_2_HOURS = 2 * 60 * 60 * 1000;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.info('Cache HIT for all profiles');
      return cached;
    } 

    this.logger.info('Cache MISS for all profiles');
    const profiles = await this.profileRepo.find({
      relations: ['createdTeams', 'createdTeams.teamPokemons', 'createdTeams.teamPokemons.pokemon'],
    });

    this.cache.set(cacheKey, profiles, TTL_2_HOURS);
    this.logger.info('Cached all profiles for 2 hours');

    return profiles;
  }

   /**
   * Record that a profile was selected by a visitor.
   * - Returns true when the increment succeeded (best-effort)
   * - Returns false for invalid id or on error (does not throw)
   */
  async recordProfileSelection(profileId: string): Promise<boolean> {
    if (!profileId) return false;

    try {
      // Ensure profile exists (avoid incrementing non-existent rows)
      const profile = await this.profileRepo.findOne({ where: { id: profileId } });
      if (!profile) {
        return false;
      }

      // Atomic increment of selectedCount
      await this.profileRepo.increment({ id: profileId }, 'selectedCount', 1);
      return true;
    } catch (err) {
      try {
        this.logger.error({ err, profileId }, 'recordProfileSelection failed');
      } catch (e) {
        // swallow logger errors
        // eslint-disable-next-line no-console
        console.error('recordProfileSelection error', err);
      }
      return false;
    }
  }

  async createProfile(name: string) {
    // Defensive: do not allow duplicate profile names for visitor flow
    // (database currently does not enforce uniqueness; return Conflict to client)
    const existing = await this.profileRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Profile name already exists');
    }

    const profile = this.profileRepo.create({ name });
    const saved = await this.profileRepo.save(profile);

    // Invalidate cached profile list so subsequent GET /profiles returns fresh data
    this.cache.delete('allProfiles');
    this.logger.info({ profileId: saved.id }, 'Created profile and invalidated allProfiles cache');

    // create a short-lived token (2 hours)
    const secret = process.env.PROFILE_TOKEN_SECRET ?? 'dev-secret';
    const expiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 hours in seconds
    const token = signPayload({ id: saved.id, createdAt: saved.createdAt, exp: expiresAt }, secret);

    return { profile: saved, token };
  }

  // New: delete a profile by id (useful while testing)
  async deleteProfile(profileId: string): Promise<{ deleted: boolean; profileId: string }> {
    const profile = await this.profileRepo.findOne({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }

    await this.profileRepo.remove(profile);

    // invalidate related caches
    this.cache.delete('allProfiles');
    this.cache.delete(`profile:${profileId}:teams`);

    this.logger.info({ profileId }, 'Deleted profile');
    return { deleted: true, profileId };
  }
}
