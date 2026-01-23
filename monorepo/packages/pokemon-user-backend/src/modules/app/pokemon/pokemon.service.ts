import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { LocalCacheService } from '../../cache/cache.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonRepo: Repository<PokemonEntity>,
    private readonly cache: LocalCacheService,
    private readonly logger: PinoLogger
  ) {}

  async getAllPokemon() {
    const cacheKey = 'allPokemon';
    const TTL_2_HOURS = 2 * 60 * 60 * 1000;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.info('Cache HIT for all Pokémon');
      return cached;
    }

    this.logger.info('Cache MISS for all Pokémon');
    const pokemon = await this.pokemonRepo.find();
    this.cache.set(cacheKey, pokemon, TTL_2_HOURS);
    this.logger.info('Cached all Pokémon for 2 hours');

    return pokemon;
  }

  async recordPokemonSelection(pokemonId: string): Promise<boolean> {
    if (!pokemonId) return false;
    try {
      await this.pokemonRepo.increment({ id: pokemonId }, 'selectedCount', 1);
      return true;
    } catch (err) {
      this.logger.error({ err, pokemonId }, 'recordPokemonSelection failed');
      return false;
    }
  }
}