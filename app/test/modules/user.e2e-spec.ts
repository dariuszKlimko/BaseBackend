import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/loadFixtures";

describe("Users (e2e)", () => {
  let appUser: INestApplication;
  let fixtures: FixtureFactory;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appUser = moduleFixture.createNestApplication();
    await appUser.init();
  });
  

  describe("/users (POST)", () => {
    it("should register user in database", () => {
   
    })
  });
  
});
