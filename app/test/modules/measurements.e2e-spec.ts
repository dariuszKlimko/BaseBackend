import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/loadFixtures";

describe("Measurements (e2e)", () => {
  let appMeasurements: INestApplication;
  let fixtures: FixtureFactory;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appMeasurements = moduleFixture.createNestApplication();
    await appMeasurements.init();
  });

  describe("/measurements (POST) - create measurement", () => {
    it("should create measurement in database", () => {});
  });

  describe("/measurements (GET) - get all measurements", () => {
    it("should get all measurements of user", () => {});
  });

  describe("/measurements/:id (GET) - get one measurement", () => {
    it("should get one measurement of user", () => {});
  });

  describe("/measurements/:id (PATCH) - update measurement", () => {
    it("should update one measurement of user", () => {});
  });

  describe("/measurements (DELETE) - delete all measurments", () => {
    it("should delete all measurements of user", () => {});
  });

  describe("/measurements/:id (DELETE) - delete one measurments", () => {
    it("should delete one measurement of user", () => {});
  });
});
