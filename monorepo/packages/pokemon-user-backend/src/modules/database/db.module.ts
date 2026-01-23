import { Module } from '@nestjs/common';
import { DbConfigService } from './db-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProfileEntity } from './entities/profile.entity';
import { PokemonEntity } from './entities/pokemon.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DbConfigService,
    }),
    TypeOrmModule.forFeature([ProfileEntity, PokemonEntity]),
  ],
  providers: [DbConfigService],
  exports: [DbConfigService, TypeOrmModule]
})
export class DbModule {}
