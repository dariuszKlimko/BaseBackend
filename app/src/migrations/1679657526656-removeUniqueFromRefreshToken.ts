import { MigrationInterface, QueryRunner } from "typeorm";

export class removeUniqueFromRefreshToken1679657526656 implements MigrationInterface {
  name = "removeUniqueFromRefreshToken1679657526656";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_375862226bb34b8289bc1b155da"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_375862226bb34b8289bc1b155da" UNIQUE ("refresh_tokens")`
    );
  }
}
