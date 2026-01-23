// seed-pokemon.ts
// This script reads /data/pokemon.gen1.json and seeds the database.
// Safe to run multiple times.

import 'reflect-metadata'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { AppDataSource } from './data-source'
import { PokemonEntity } from './entities/pokemon.entity'

dotenv.config()

const DATA_PATH = path.resolve(
  __dirname,
  '../../../data/pokemon.gen1.json'
)

async function run() {
  console.log('🌱 Starting Pokémon DB seed')

  await AppDataSource.initialize()
  console.log('✅ Database connected')

  const repo = AppDataSource.getRepository(PokemonEntity)

  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  const pokemon = JSON.parse(raw) as {
    name: string
    pokedexNumber: number
  }[]

  await AppDataSource.manager.transaction(async (manager) => {
    for (const p of pokemon) {
      const exists = await repo.findOne({
        where: { pokedexNumber: p.pokedexNumber },
      })

      if (!exists) {
        await repo.save(repo.create(p))
      }
    }
  })

  console.log(`✅ Seeded ${pokemon.length} Pokémon (repeatable)`)
  await AppDataSource.destroy()
}

run().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})




