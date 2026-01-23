import { IsString, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name!: string;

  @IsUUID()
  profileId!: string;
}