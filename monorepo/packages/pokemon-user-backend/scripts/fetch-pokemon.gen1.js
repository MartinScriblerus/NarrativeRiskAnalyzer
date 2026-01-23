// fetch-pokemon.gen1.js
// Generates /data/pokemon.gen1.json by fetching from PokéAPI.
// Run only if you need to regenerate the JSON.

const fs = require('fs')
const path = require('path')

const OUTPUT_PATH = path.resolve(__dirname, '../data/pokemon.gen1.json')

async function run() {
  const pokemon = []

  console.log('Fetching 150 Pokémon from PokéAPI...')

  for (let i = 1; i <= 150; i++) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
    const data = await res.json()

    pokemon.push({
      name: data.name,
      pokedexNumber: data.id,
    })
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(pokemon, null, 2))

  console.log(`Wrote ${pokemon.length} Pokémon to ${OUTPUT_PATH}`)
}

run().catch((err) => {
  console.error('Error running seed script: ', err)
  process.exit(1)
})
