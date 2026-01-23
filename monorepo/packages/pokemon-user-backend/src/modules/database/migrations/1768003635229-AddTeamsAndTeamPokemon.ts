import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class AddTeamsAndTeamPokemon1768003635229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // 1️⃣ Add persistent column to profiles if it doesn't exist
    await queryRunner.query(`
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS persistent boolean DEFAULT false
    `);

    // 2️⃣ Create 'teams' table
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'profileId', type: 'uuid', isNullable: false },
          { name: 'createdAt', type: 'timestamptz', default: 'NOW()' },
        ],
      }),
      true
    );

      // 2️⃣ Add foreign key from teams.profileId → profiles.id
      await queryRunner.createForeignKey(
          'teams',
          new TableForeignKey({
              columnNames: ['profileId'],
              referencedTableName: 'profiles',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
          })
      );

      // 3️⃣ Create 'team_pokemon' join table
      await queryRunner.createTable(
          new Table({
              name: 'team_pokemon',
              columns: [
                  {
                      name: 'id',
                      type: 'uuid',
                      isPrimary: true,
                      isGenerated: true,
                      generationStrategy: 'uuid',
                  },
                  {
                      name: 'teamId',
                      type: 'uuid',
                      isNullable: false,
                  },
                  {
                      name: 'pokemonId',
                      type: 'uuid',
                      isNullable: false,
                  },
              ],
          }),
          true
      );

      // 4️⃣ Add unique constraint on (teamId, pokemonId)
      await queryRunner.createUniqueConstraint(
          'team_pokemon',
          new TableUnique({
              name: 'UQ_team_pokemon',
              columnNames: ['teamId', 'pokemonId'],
          })
      );

      // 5️⃣ Add foreign key from team_pokemon.teamId → teams.id
      await queryRunner.createForeignKey(
          'team_pokemon',
          new TableForeignKey({
              columnNames: ['teamId'],
              referencedTableName: 'teams',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
          })
      );

      // 6️⃣ Add foreign key from team_pokemon.pokemonId → pokemon.id
      await queryRunner.createForeignKey(
          'team_pokemon',
          new TableForeignKey({
              columnNames: ['pokemonId'],
              referencedTableName: 'pokemon',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
          })
      );

      // 7️⃣ Seed default Profiles only
      await queryRunner.query(`
          INSERT INTO profiles (id, name, "persistent")
          VALUES
              (gen_random_uuid(), 'Ash', true),
              (gen_random_uuid(), 'Misty', true),
              (gen_random_uuid(), 'Professor Rowan', true)
          ON CONFLICT DO NOTHING
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop join table first
        await queryRunner.dropTable('team_pokemon');

        // Drop teams table
        await queryRunner.dropTable('teams');

        // Delete seeded Profiles (optional)
        await queryRunner.query(`
            DELETE FROM profiles WHERE name IN ('Ash','Misty','Professor Rowan');
        `);
    }
}
