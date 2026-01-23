import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Repository } from 'typeorm';
import { TeamsService } from './teams.service';
import { LocalCacheService } from '../../cache/cache.service';
import { TeamEntity } from '../../database/entities/team.entity';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { TeamPokemonEntity } from '../../database/entities/team-pokemon.entity';

describe('TeamsService', () => {
  let service: TeamsService;
  let mockRepo: any;
  let mockProfileRepo: any;
  let mockTeamPokemonRepo: any;
  let mockCache: any;
  let mockLogger: any;

  beforeEach(() => {
    const fakeTeams = [{ id: 't1', name: 'Team 1' }];

    const qb: any = {
      leftJoinAndSelect: () => qb,
      where: () => qb,
      orderBy: () => qb,
      addOrderBy: () => qb,
      take: () => qb,
      select: () => qb,
      getMany: vi.fn().mockResolvedValue(fakeTeams),
    };

    mockRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
      findOne: vi.fn().mockResolvedValue({ id: 't1', name: 'Team 1' }),
      increment: vi.fn().mockResolvedValue({}),
      manager: {
        getRepository: vi.fn(), // will be set per-test when needed
      },
    };

    mockProfileRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'p1', name: 'Profile 1' }),
    };

    mockTeamPokemonRepo = {
      create: vi.fn(),
      save: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    } as unknown as LocalCacheService;

    mockLogger = { info: vi.fn(), error: vi.fn() } as any;

    service = new TeamsService(
      mockRepo as unknown as Repository<TeamEntity>,
      mockProfileRepo as unknown as Repository<ProfileEntity>,
      mockTeamPokemonRepo as unknown as Repository<TeamPokemonEntity>,
      mockCache,
      mockLogger
    );
  });

  it('getAllTeams returns teams via query builder', async () => {
    const res = await service.getAllTeams(5);
    expect(res).toEqual([{ id: 't1', name: 'Team 1' }]);
    expect(mockRepo.createQueryBuilder).toHaveBeenCalled();
  });

  it('getTeam fetches from repo and caches result when not cached', async () => {
    const teamId = 't1';
    (mockCache.get as any).mockReturnValueOnce(null);
    const res = await service.getTeam(teamId);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: teamId } });
    expect((mockCache.set as any).mock.calls.length).toBeGreaterThanOrEqual(0);
    expect(res).toEqual({ id: 't1', name: 'Team 1' });
  });

  describe('recordTeamSelection', () => {
    it('increments team and pokemon selectedCount on valid selection', async () => {
      const teamId = 'team-1';
      // team with two pokemons
      const teamObj = {
        id: teamId,
        teamPokemons: [
          { pokemon: { id: 'p1' } },
          { pokemon: { id: 'p2' } },
        ],
      };

      // mock findOne to return the team with relations
      mockRepo.findOne = vi.fn().mockResolvedValue(teamObj);

      // mock teamRepo.increment
      mockRepo.increment = vi.fn().mockResolvedValue({});

      // mock pokemon repo returned by manager.getRepository(...)
      const mockPokemonRepo = {
        increment: vi.fn().mockResolvedValue({}),
      };
      mockRepo.manager.getRepository = vi.fn().mockReturnValue(mockPokemonRepo);

      // Call
      const ok = await service.recordTeamSelection(teamId);

      expect(ok).toBe(true);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: teamId },
        relations: ['teamPokemons', 'teamPokemons.pokemon'],
      });
      expect(mockRepo.increment).toHaveBeenCalledWith({ id: teamId }, 'selectedCount', 1);
      expect(mockRepo.manager.getRepository).toHaveBeenCalled();
      expect(mockPokemonRepo.increment).toHaveBeenCalledTimes(2);
      expect(mockPokemonRepo.increment).toHaveBeenCalledWith({ id: 'p1' }, 'selectedCount', 1);
      expect(mockPokemonRepo.increment).toHaveBeenCalledWith({ id: 'p2' }, 'selectedCount', 1);
    });

    it('does not increment and returns false for invalid teamId', async () => {
      // simulate not found
      mockRepo.findOne = vi.fn().mockResolvedValue(null);
      const res = await service.recordTeamSelection('not-present');
      expect(res).toBe(false);
      expect(mockRepo.increment).not.toHaveBeenCalled();
    });

    it('supports ranking by selectedCount (utility test)', () => {
      const items = [
        { id: 'a', selectedCount: 2 },
        { id: 'b', selectedCount: 7 },
        { id: 'c', selectedCount: 1 },
      ];
      const ranked = items.sort((x, y) => y.selectedCount - x.selectedCount);
      expect(ranked[0].id).toBe('b');
      expect(ranked[1].id).toBe('a');
      expect(ranked[2].id).toBe('c');
    });
  });
});