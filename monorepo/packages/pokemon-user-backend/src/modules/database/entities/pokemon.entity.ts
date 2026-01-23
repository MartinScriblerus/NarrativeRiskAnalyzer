import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamPokemonEntity } from './team-pokemon.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('pokemon')
export class PokemonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'int' })
  pokedexNumber!: number;

  @OneToMany(() => TeamPokemonEntity, (tp) => tp.pokemon)
  teamPokemons!: TeamPokemonEntity[];

  @ApiProperty({ type: 'number', description: 'Number of times profile selected' })
  @Column({ type: 'int', default: 0 })
  selectedCount!: number;
}