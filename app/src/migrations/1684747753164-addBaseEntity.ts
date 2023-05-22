import { MigrationInterface, QueryRunner } from "typeorm";

export class addBaseEntity1684747753164 implements MigrationInterface {
  name = "addBaseEntity1684747753164";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "measurements" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "created_at"`);
  }
}
