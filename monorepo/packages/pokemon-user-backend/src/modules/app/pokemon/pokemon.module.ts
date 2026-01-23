import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([PokemonEntity])
  ],
  controllers: [PokemonController],
  providers: [PokemonService],
  exports: [PokemonService]
})
export class PokemonModule {}
