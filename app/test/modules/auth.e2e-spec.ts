import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/loadFixtures";

describe("Auth (e2e)", () => {
  let appAuth: INestApplication;
  let fixtures: FixtureFactory;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appAuth = moduleFixture.createNestApplication();
    await appAuth.init();
  });

  describe("/auth/confirmation/:verificationCode (GET) - confirm user account", () => {
    it("should confirm user account in database", () => {});
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
