import { MigrationInterface, QueryRunner } from "typeorm";

export class refactorAut1679993284596 implements MigrationInterface {
  name = "refactorAut1679993284596";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_3698355a0c93f0b654e18fb0d9c"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verification_code"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "verification_code" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_3698355a0c93f0b654e18fb0d9c" UNIQUE ("verification_code")`
    );
  }
}
