import { MigrationInterface, QueryRunner } from "typeorm";

export class removeUniqueFromDueDate1679667578295 implements MigrationInterface {
  name = "removeUniqueFromDueDate1679667578295";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "measurements" DROP CONSTRAINT "UQ_feab566b182e23e4bafc2b31698"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "UQ_feab566b182e23e4bafc2b31698" UNIQUE ("measurement_date")`
    );
  }
}
