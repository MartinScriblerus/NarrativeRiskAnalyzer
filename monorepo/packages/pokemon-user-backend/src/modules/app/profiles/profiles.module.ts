import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PokemonModule } from '../pokemon/pokemon.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { PokemonEntity } from '../../database/entities/pokemon.entity';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [
    PokemonModule,
    DbModule,
    TypeOrmModule.forFeature([
      ProfileEntity, 
      // PokemonEntity << commenting for now until further setup 
    ])
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
