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

  // describe("/users (PATCH) - update user's data", () => {
  //   it("should update user height and email in database for given accessToken if height is number and email is email", async () => {
  //     await request
  //       .default(app.getHttpServer())
  //       .patch("/users")
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ height: 180, email: "user10@email.com" })
  //       .then((res) => {
  //         expect(res.status).toEqual(HttpStatus.OK);
  //         expect(res.body.height).toEqual(180);
  //         expect(res.body.email).toEqual("user10@email.com");
  //       });

  //     return userRepository.findOneBy({ email: "user10@email.com" }).then((user) => {
  //       expect(user.height).toEqual(180);
  //       expect(user.email).toEqual("user10@email.com");
  //     });
  //   });

  //   it("should not update user height, email and password in database for given accessToken if height is number, email is email and password matches strong password ", () => {
  //     return request
  //       .default(app.getHttpServer())
  //       .patch("/users")
  //       .set("Authorization", "Bearer someToken")
  //       .then((res) => {
  //         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //       });
  //   });

  //   it("should not update user height in database for given accessToken if height is not number", () => {
  //     return request
  //       .default(app.getHttpServer())
  //       .patch("/users")
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ height: "180" })
  //       .then((res) => {
  //         expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //       });
  //   });

  //   it("should not update user height in database for given accessToken if email is not email", () => {
  //     return request
  //       .default(app.getHttpServer())
  //       .patch("/users")
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ email: "user10email.com" })
  //       .then((res) => {
  //         expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //       });
  //   });
  // });

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
