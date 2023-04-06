import { MigrationInterface, QueryRunner } from "typeorm";

export class addVerificationCodeColumn1680521652747 implements MigrationInterface {
  name = "addVerificationCodeColumn1680521652747";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "verification_code" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verification_code"`);
  }
}
