import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/loadFixtures";

describe("Users (e2e)", () => {
  let appUsers: INestApplication;
  let fixtures: FixtureFactory;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appUsers = moduleFixture.createNestApplication();
    await appUsers.init();
  });

  describe("/users (POST) - register user", () => {
    it("should register user in database", () => {});
  });

  describe("/users (GET) - get user's data", () => {
    it("should get user from database", () => {});
  });

  describe("/users (PATCH) - update user's data", () => {
    it("should update user in database", () => {});
  });

  describe("/users (DELETE) - delete user's account", () => {
    it("should delete user account", () => {});
  });
});
