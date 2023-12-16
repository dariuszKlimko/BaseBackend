import { MigrationInterface, QueryRunner } from "typeorm";

export class addRoleEntity1701950393258 implements MigrationInterface {
  name = "addRoleEntity1701950393258";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin_0', 'admin_1', 'admin_2')`);
    await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "refresh_tokens" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "refresh_tokens" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
