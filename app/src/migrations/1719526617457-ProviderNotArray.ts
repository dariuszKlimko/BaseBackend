import { MigrationInterface, QueryRunner } from "typeorm";

export class ProviderNotArray1719526617457 implements MigrationInterface {
    name = 'ProviderNotArray1719526617457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('GOOGLE', 'FACEBOOK', 'X')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" "public"."users_provider_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" text array NOT NULL DEFAULT '{}'`);
    }

}
