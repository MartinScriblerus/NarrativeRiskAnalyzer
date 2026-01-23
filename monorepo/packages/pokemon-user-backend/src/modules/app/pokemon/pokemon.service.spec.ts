import { describe, it, beforeEach, expect, vi } from 'vitest';
import { PokemonService } from './pokemon.service';
import { LocalCacheService } from '../../cache/cache.service';
import { PinoLogger } from 'nestjs-pino';

describe('PokemonService', () => {
  let service: PokemonService;
  let mockRepo: any;
  let mockCache: LocalCacheService;
  let mockLogger: PinoLogger;

  beforeEach(() => {
    mockRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      reset: vi.fn(),
      keys: vi.fn(),
      dump: vi.fn(),
      size: vi.fn(),
      has: vi.fn(),
    } as unknown as LocalCacheService;

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      fatal: vi.fn(),
    } as unknown as PinoLogger;


    service = new PokemonService(mockRepo, mockCache, mockLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all Pokémon', async () => {
    const fakePokemon = [
      { id: '1', name: 'Pikachu', pokedexNumber: 25 },
      { id: '2', name: 'Bulbasaur', pokedexNumber: 1 },
    ];
    mockRepo.find.mockResolvedValue(fakePokemon);

    const result = await service.getAllPokemon();
    expect(result).toEqual(fakePokemon);
    expect(mockRepo.find).toHaveBeenCalled();
  });
});
