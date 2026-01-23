import 'dotenv/config'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { PokemonEntity } from './entities/pokemon.entity'
import { ProfileEntity } from './entities/profile.entity'
import { TeamPokemonEntity } from './entities/team-pokemon.entity'
import { TeamEntity } from './entities/team.entity'

if (!process.env.POSTGRES_USER) {
  require('dotenv').config()
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: required('POSTGRES_USER'),
  password: required('POSTGRES_PASSWORD'),
  database: process.env.POSTGRES_DB ?? 'pokemon',

  entities: [PokemonEntity, ProfileEntity, TeamPokemonEntity, TeamEntity],
  migrations: [
    'packages/pokemon-user-backend/src/modules/database/migrations/*.ts',
    'dist/packages/pokemon-user-backend/src/modules/database/migrations/*.js'
  ],
  synchronize: false,
})