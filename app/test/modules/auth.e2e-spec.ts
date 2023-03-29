import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe("/auth/confirmation/:token (GET) - confirm user account", () => {
    it("should confirm user account in database", () => {});
  });

  describe("/auth/resend-confirmation/ (POST) - resend confirmation link", () => {
    it("should resend confirmation link", () => {});
  });

  describe("/auth (POST) - login user", () => {
    it("should login user", () => {});
  });

  describe("/auth (PATCH) - logout user ", () => {
    it("should logout user", () => {});
  });

  describe("/auth/tokens (PATCH) - get new tokens ", () => {
    it("should get new tokens", () => {});
  });
});
