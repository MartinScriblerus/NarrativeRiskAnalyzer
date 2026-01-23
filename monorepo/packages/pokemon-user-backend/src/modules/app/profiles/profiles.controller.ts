import { Controller, Get, Param, NotFoundException, ParseUUIDPipe, Post, Body, Delete } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { PinoLogger } from 'nestjs-pino';
import { ApiTags, ApiParam, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';


@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly logger: PinoLogger
  ) {}

  // GET /profiles - return all profiles (with teams)
  @Get()
  @ApiOkResponse({ description: 'List of all profiles with teams' })
  async getAllProfiles() {
    this.logger.info('Fetching all profiles');
    const profiles = await this.profilesService.getAllProfiles();
    return profiles;
  }

  // GET /profiles/:profileId/teams - return teams for a single profile
  @Get(':profileId/teams')
  @ApiParam({ name: 'profileId', description: 'UUID of the Profile' })
  @ApiOkResponse({ description: 'Teams for the specified profile' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  async getProfileTeams(@Param('profileId', new ParseUUIDPipe()) profileId: string) {
    const teams = await this.profilesService.getTeams(profileId);

    if(teams && teams.length === 0) {
        return {
          statusCode: 200,
          data: teams,
          meta: { count: teams.length },
          message: teams.length ? undefined : `${teams.length ?? 0} teams found for profile ${profileId}`
        };
    }

    if (!teams) {
      throw new NotFoundException(`No teams found for profile ${profileId}`);
    }

    return teams;
  }

  @Post()
  @ApiOkResponse({ description: 'Create a new profile' })
  async createProfile(@Body('name') name: string) {
    return this.profilesService.createProfile(name);
  }

  // profiles.controller.ts
  @Post(':profileId/select')
  async selectProfile(@Param('profileId', new ParseUUIDPipe()) profileId: string) {
    const ok = await this.profilesService.recordProfileSelection(profileId);
    return { ok };
  }

  @Delete(':profileId')
  @ApiOkResponse({ description: 'Delete a profile by ID' })
  async deleteProfile(@Param('profileId', new ParseUUIDPipe()) profileId: string) {
    return this.profilesService.deleteProfile(profileId);
  }
}
