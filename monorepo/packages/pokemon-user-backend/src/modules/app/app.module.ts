import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DbModule } from '../database/db.module';
import { CacheModule } from '../cache/cache.module';
import { TeamsModule } from './teams/teams.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { LocalCacheService } from '../cache';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

@Module({
  imports: [
    CacheModule,
    TeamsModule,
    ProfilesModule,
    PokemonModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
          },
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().default('localhost'),
        POSTGRES_PORT: Joi.number().default(5432),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().default('pokemon'),
        NODE_ENV: Joi.string().valid('development','production','test').default('development'),
      }),
    }),
    DbModule
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly cache: LocalCacheService,
    private readonly logger: PinoLogger
  ) {}

  onModuleInit() {
    const size = this.cache.size();
    const keys = this.cache.keys();
    const sample = keys.slice(0, 20);
    
    // don't log entire dump by default (can be large) — log small sample and count
    this.logger.info({ cacheSize: size, sampleKeys: sample }, 'Cache overview on startup');
  }
}