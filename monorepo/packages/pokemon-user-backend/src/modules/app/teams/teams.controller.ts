import { Controller, Get, Param, Post, Body, Patch, ParseUUIDPipe, Req, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOkResponse({description: 'Get all teams'})
  async getAllTeams(topN: number) {
    return this.teamsService.getAllTeams(topN);
  }

  @Get(':teamId')
  @ApiOkResponse({ description: 'Get a single team by ID' })
  async getTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    return this.teamsService.getTeam(teamId);
  }

  @Get(':teamId/pokemon-names')
  @ApiOkResponse({ description: 'Get human-readable pokemon names for a team' })
  async getTeamPokemonNames(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    const names = await this.teamsService.getPokemonNamesForTeam(teamId);
    return { teamId, pokemonNames: names, count: names.length };
  }

  @Post()
  @ApiOkResponse({ description: 'Create a new team' })
  async createTeam(@Body() dto: CreateTeamDto, @Req() req) {
    return this.teamsService.createTeam(dto);
  }

  @Post(':teamId/select')
  @ApiOkResponse({ description: 'Record team selection (visitor click)' })
  async selectTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    const ok = await this.teamsService.recordTeamSelection(teamId);
    return { ok };
  }

  @Patch(':teamId')
  @ApiOkResponse({ description: 'Update an existing team' })
  async updateTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string, @Body() update: UpdateTeamDto) {
    return this.teamsService.updateTeam(teamId, update);
  }

  @Delete(':teamId')
  @ApiOkResponse({ description: 'Delete a team by ID' })
  async deleteTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    return this.teamsService.deleteTeam(teamId);
  }
}
