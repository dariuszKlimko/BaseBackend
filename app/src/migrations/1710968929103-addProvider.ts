import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProvider1710968929103 implements MigrationInterface {
  name = "AddProvider1710968929103";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "provider" text array NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
  }
}
