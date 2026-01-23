import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { TeamEntity } from './team.entity';
import { PokemonEntity } from './pokemon.entity';

@Entity('team_pokemon')
@Unique(['team', 'pokemon'])
export class TeamPokemonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TeamEntity, (team) => team.teamPokemons, { onDelete: 'CASCADE' })
  team!: TeamEntity;

  @ManyToOne(() => PokemonEntity, (pokemon) => pokemon.teamPokemons, { onDelete: 'CASCADE' })
  pokemon!: PokemonEntity;
}