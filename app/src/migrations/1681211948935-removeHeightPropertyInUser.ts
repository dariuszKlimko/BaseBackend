import { MigrationInterface, QueryRunner } from "typeorm";

export class removeHeightPropertyInUser1681211948935 implements MigrationInterface {
  name = "removeHeightPropertyInUser1681211948935";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "height" integer`);
  }
}
