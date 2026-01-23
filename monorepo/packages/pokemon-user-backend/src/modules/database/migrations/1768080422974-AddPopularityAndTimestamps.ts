import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPopularityAndTimestamps1768080422974 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ---- Profiles ----
        await queryRunner.query(`
            ALTER TABLE "profiles"
            ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        await queryRunner.query(`
            ALTER TABLE "profiles"
            ADD COLUMN IF NOT EXISTS "selectedCount" INTEGER NOT NULL DEFAULT 0
        `);

        // ---- Teams ----
        await queryRunner.query(`
            ALTER TABLE "teams"
            ADD COLUMN IF NOT EXISTS "selectedCount" INTEGER NOT NULL DEFAULT 0
        `);

        // ---- Pokémon ----
        await queryRunner.query(`
            ALTER TABLE "pokemon"
            ADD COLUMN IF NOT EXISTS "selectedCount" INTEGER NOT NULL DEFAULT 0
        `);

        // indexes for top-N queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_profiles_selected_count"
            ON "profiles" ("selectedCount" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_teams_selected_count"
            ON "teams" ("selectedCount" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_pokemon_selected_count"
            ON "pokemon" ("selectedCount" DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_pokemon_selected_count"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_teams_selected_count"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_profiles_selected_count"`);

        await queryRunner.query(`
            ALTER TABLE "pokemon"
            DROP COLUMN IF EXISTS "selectedCount"
        `);

        await queryRunner.query(`
            ALTER TABLE "teams"
            DROP COLUMN IF EXISTS "selectedCount"
        `);

        await queryRunner.query(`
            ALTER TABLE "profiles"
            DROP COLUMN IF EXISTS "selectedCount"
        `);

        await queryRunner.query(`
            ALTER TABLE "profiles"
            DROP COLUMN IF EXISTS "createdAt"
        `);
    }

}
