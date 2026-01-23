import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOkResponse({ description: 'List of all Pokémon' })
  async getAllPokemon() {
    return this.pokemonService.getAllPokemon();
  }

  @Post(':pokemonId/select')
  @ApiOkResponse({ description: 'Record pokemon selection' })
  async selectPokemon(@Param('pokemonId', new ParseUUIDPipe()) pokemonId: string) {
    const ok = await this.pokemonService.recordPokemonSelection(pokemonId);
    return { ok };
  }
}