import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamPokemonsService } from './team-pokemons.service';
import { TeamPokemonsController } from './team-pokemons.controller';
import { TeamPokemonEntity } from '../../database/entities/team-pokemon.entity';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { LocalCacheService } from '../../cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamPokemonEntity, PokemonEntity])],
  providers: [TeamPokemonsService, LocalCacheService],
  controllers: [TeamPokemonsController],
})
export class TeamPokemonsModule {}
