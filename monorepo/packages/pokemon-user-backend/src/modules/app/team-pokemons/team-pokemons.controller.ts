import { Controller, Get, Post, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { TeamPokemonsService } from './team-pokemons.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Team-Pokémon')
@Controller('teams/:teamId/pokemons')
export class TeamPokemonsController {
  constructor(private readonly service: TeamPokemonsService) {}

  @Get()
  @ApiOkResponse({ description: 'List Pokémon in a team' })
  async list(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    return this.service.list(teamId);
  }

  @Post(':pokemonId')
  @ApiOkResponse({ description: 'Add a Pokémon to a team' })
  async add(@Param('teamId', new ParseUUIDPipe()) teamId: string, @Param('pokemonId', new ParseUUIDPipe()) pokemonId: string) {
    return this.service.add(teamId, pokemonId);
  }

  @Delete(':pokemonId')
  @ApiOkResponse({ description: 'Remove a Pokémon from a team' })
  async remove(@Param('teamId', new ParseUUIDPipe()) teamId: string, @Param('pokemonId', new ParseUUIDPipe()) pokemonId: string) {
    return this.service.remove(teamId, pokemonId);
  }
}
