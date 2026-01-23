import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamEntity } from '../../database/entities/team.entity';
import { LocalCacheService } from '../../cache/cache.service';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { TeamPokemonEntity } from '../../database/entities/team-pokemon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, ProfileEntity, TeamPokemonEntity])],
  providers: [TeamsService, LocalCacheService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}