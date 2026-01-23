import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamPokemonEntity } from '../../database/entities/team-pokemon.entity';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TeamPokemonsService {
  constructor(
    private readonly logger: PinoLogger,
    @InjectRepository(TeamPokemonEntity)
    private readonly teamPokemonRepo: Repository<TeamPokemonEntity>,
    @InjectRepository(PokemonEntity)
    private readonly pokemonRepo: Repository<PokemonEntity>
  ) {
    this.logger.info({pokemonRepo }, 'team-pokemons service initialized');
  }

  async list(teamId: string) {
    
    return this.teamPokemonRepo.find({
      where: { team: { id: teamId } },
      relations: ['pokemon'],
    });
  }

  async add(teamId: string, pokemonId: string) {
    const teamPokemon =  this.teamPokemonRepo.create({
      team: { id: teamId } as any,
      pokemon: { id: pokemonId } as any,
    });
    return this.teamPokemonRepo.save(teamPokemon);
  }

  async remove(teamId: string, pokemonId: string) {
    await this.teamPokemonRepo.delete({
      team: { id: teamId },
      pokemon: { id: pokemonId },
    });
  }
}
