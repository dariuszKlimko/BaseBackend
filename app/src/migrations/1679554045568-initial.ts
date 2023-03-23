import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1679554045568 implements MigrationInterface {
    name = 'initial1679554045568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "email" text NOT NULL, "password" text, "height" integer, "refresh_tokens" text array DEFAULT '{}', "verification_code" text, "verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_375862226bb34b8289bc1b155da" UNIQUE ("refresh_tokens"), CONSTRAINT "UQ_3698355a0c93f0b654e18fb0d9c" UNIQUE ("verification_code"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
