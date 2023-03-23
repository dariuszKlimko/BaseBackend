import { MigrationInterface, QueryRunner } from "typeorm";

export class addMeasurementEntity1679556191912 implements MigrationInterface {
  name = "addMeasurementEntity1679556191912";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "measurements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bmi" integer, "weight" integer, "callories_delivered" integer, "distance_traveled" integer, "measurement_date" text, CONSTRAINT "PK_3c0e7812563f27fd68e8271661b" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "measurements"`);
  }
}
