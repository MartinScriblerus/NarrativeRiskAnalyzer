import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let mockRepo: any;
  let mockCache: any;
  const mockLogger = { info: vi.fn(), debug: vi.fn() } as any;

  beforeEach(() => {
    mockRepo = {
      find: vi.fn().mockResolvedValue([{ id: 'p1', username: 'ash', createdTeams: [] }]),
      findOne: vi.fn().mockResolvedValue({ id: 'p1', createdTeams: [{ id: 't1', name: 'Team A', teamPokemons: [] }] }),
      increment: vi.fn().mockResolvedValue({}),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
    };

    service = new ProfilesService(mockRepo as any, mockCache as any, mockLogger);
  });

  it('caches teams for a profile', async () => {
    const profileId = 'abc';
    // First call: cache miss, repo returns teams
    (mockCache.get as any).mockReturnValueOnce(null);
    (mockRepo.findOne as any).mockResolvedValueOnce({
      id: profileId,
      createdTeams: [{ id: 't1', name: 'Team A', teamPokemons: [] }],
    });

    const first = await service.getTeams(profileId);
    expect(first.length).toBe(1);
    expect(mockCache.set).toHaveBeenCalledWith(`profile:${profileId}:teams`, first, expect.any(Number));

    // Second call: cache hit, repo should not be called again
    (mockCache.get as any).mockReturnValueOnce(first);
    const second = await service.getTeams(profileId);
    expect(second).toEqual(first);
    expect(mockRepo.findOne).toHaveBeenCalledTimes(1);
  });

  it('getAllProfiles returns profiles and caches them', async () => {
    (mockCache.get as any).mockReturnValueOnce(null);
    const res = await service.getAllProfiles();
    expect(res).toEqual([{ id: 'p1', username: 'ash', createdTeams: [] }]);
    expect(mockRepo.find).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledWith('allProfiles', res, expect.any(Number));
  });

  it('getTeams returns teams for a profile', async () => {
    (mockCache.get as any).mockReturnValueOnce(null);
    (mockRepo.findOne as any).mockResolvedValueOnce({ id: 'p1', createdTeams: [{ id: 't1', name: 'Team 1', teamPokemons: [] }] });

    const res = await service.getTeams('p1');
    expect(res.length).toBeGreaterThanOrEqual(1);
    expect(mockRepo.findOne).toHaveBeenCalled();
  });

    it('increments selectedCount for a valid profile', async () => {
    const ok = await service.recordProfileSelection('p1');
    expect(ok).toBe(true);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(mockRepo.increment).toHaveBeenCalledWith({ id: 'p1' }, 'selectedCount', 1);
  });

  it('returns false for missing profile', async () => {
    mockRepo.findOne = vi.fn().mockResolvedValue(null);
    const ok = await service.recordProfileSelection('missing');
    expect(ok).toBe(false);
    expect(mockRepo.increment).not.toHaveBeenCalled();
  });
});