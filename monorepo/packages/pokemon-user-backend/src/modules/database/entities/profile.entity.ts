import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamEntity } from './team.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'boolean', default: false })
  persistent!: boolean;

  @OneToMany(() => TeamEntity, (team) => team.profile)
  createdTeams!: TeamEntity[];

  @ApiProperty({ type: 'number', description: 'Number of times profile selected' })
  @Column({ type: 'int', default: 0 })
  selectedCount!: number;
}