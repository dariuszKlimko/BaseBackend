import { MigrationInterface, QueryRunner } from "typeorm";

export class ProviderEditToString1717591523913 implements MigrationInterface {
    name = 'ProviderEditToString1717591523913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" text array NOT NULL DEFAULT '{}'`);
    }

}
