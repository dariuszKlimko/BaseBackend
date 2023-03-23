import { MigrationInterface, QueryRunner } from "typeorm";

export class addRelationUserMeasurement1679582687126 implements MigrationInterface {
  name = "addRelationUserMeasurement1679582687126";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "callories_delivered"`);
    await queryRunner.query(`ALTER TABLE "measurements" ADD "calories_delivered" integer`);
    await queryRunner.query(`ALTER TABLE "measurements" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "bmi"`);
    await queryRunner.query(`ALTER TABLE "measurements" ADD "bmi" double precision`);
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "UQ_feab566b182e23e4bafc2b31698" UNIQUE ("measurement_date")`
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "FK_63398be08cc5c00457b503ddca1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "measurements" DROP CONSTRAINT "FK_63398be08cc5c00457b503ddca1"`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP CONSTRAINT "UQ_feab566b182e23e4bafc2b31698"`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "bmi"`);
    await queryRunner.query(`ALTER TABLE "measurements" ADD "bmi" integer`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "calories_delivered"`);
    await queryRunner.query(`ALTER TABLE "measurements" ADD "callories_delivered" integer`);
  }
}
