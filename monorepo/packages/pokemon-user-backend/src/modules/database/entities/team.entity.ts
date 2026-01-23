import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { TeamPokemonEntity } from './team-pokemon.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('teams')
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @ManyToOne(() => ProfileEntity, (profile) => profile.createdTeams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: ProfileEntity;

  @OneToMany(() => TeamPokemonEntity, (tp) => tp.team)
  teamPokemons!: TeamPokemonEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty({ type: 'number', description: 'Number of times profile selected' })
  @Column({ type: 'int', default: 0 })
  selectedCount!: number;
}