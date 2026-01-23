import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ProfilesController } from './profiles.controller';

describe('ProfilesController', () => {
  let controller: ProfilesController;

  const mockService = {
    getAllProfiles: vi.fn().mockResolvedValue([{ id: 'p1', username: 'ash', createdTeams: [] }]),
    getTeams: vi.fn().mockResolvedValue([{ id: 't1', name: 'Team 1' }]),
  };

  const mockLogger = { info: vi.fn(), debug: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    controller = new ProfilesController(mockService as any, mockLogger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllProfiles returns profiles', async () => {
    const res = await controller.getAllProfiles();
    expect(res).toEqual([{ id: 'p1', username: 'ash', createdTeams: [] }]);
    expect(mockService.getAllProfiles).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('Fetching all profiles');
  });

  it('getProfileTeams returns teams for a profile', async () => {
    const res = await controller.getProfileTeams('p1');
    expect(res).toEqual([{ id: 't1', name: 'Team 1' }]);
    expect(mockService.getTeams).toHaveBeenCalledWith('p1');
  });
});