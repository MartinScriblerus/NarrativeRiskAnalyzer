import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TeamsController } from './teams.controller';

describe('TeamsController', () => {
  let controller: TeamsController;

  const mockService = {
    getAllTeams: vi.fn().mockResolvedValue([{ id: 't1', name: 'Team 1' }]),
    getTeam: vi.fn().mockResolvedValue({ id: 't1', name: 'Team 1' }),
  };

  beforeEach(() => {
    controller = new TeamsController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllTeams returns teams', async () => {
    const result = await controller.getAllTeams(10);
    expect(result).toEqual([{ id: 't1', name: 'Team 1' }]);
    expect(mockService.getAllTeams).toHaveBeenCalledWith(10);
  });

  it('getTeam returns a single team', async () => {
    const result = await controller.getTeam('t1');
    expect(result).toEqual({ id: 't1', name: 'Team 1' });
    expect(mockService.getTeam).toHaveBeenCalledWith('t1');
  });
});