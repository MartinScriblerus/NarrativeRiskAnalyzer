import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { PokemonEntity } from './entities/pokemon.entity';
import { ProfileEntity } from './entities/profile.entity';
import { TeamEntity } from './entities/team.entity';
import { TeamPokemonEntity } from './entities/team-pokemon.entity';

@Injectable()
export class DbConfigService {
  private readonly logger = new Logger(DbConfigService.name);

  constructor(private readonly config: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const host = this.config.get<string>('POSTGRES_HOST');
    const portRaw = this.config.get<number | string>('POSTGRES_PORT');
    const port = typeof portRaw === 'string' ? parseInt(portRaw, 10) : portRaw;
    const username = this.config.get<string>('POSTGRES_USER');
    const password = this.config.get<string>('POSTGRES_PASSWORD');
    const database = this.config.get<string>('POSTGRES_DB');

    if (!host || !port || !username || !password || !database) {
      this.logger.error('[DbConfigService] Missing database configuration. Aborting bootstrap.');
      throw new Error('Missing database configuration');
    }
    this.logger.log(
      `[DbConfigService] TypeORM config: host=${host} port=${port} user=${username} db=${database}`
    );

    const opts: TypeOrmModuleOptions = {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [ProfileEntity, PokemonEntity, TeamEntity, TeamPokemonEntity],
        synchronize: false,
    };
    return opts;
  }
}
