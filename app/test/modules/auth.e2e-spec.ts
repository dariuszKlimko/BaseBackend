import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let configService: ConfigService; 
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ConfigService, JwtService],
    }).compile();

    jwtService = moduleFixture.get(JwtService);
    configService = moduleFixture.get(ConfigService);
    userRepository = moduleFixture.get("UserRepository");

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // asscessTokenUser8
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
    it("should confirm user account in database if token is valid", async() => {
      const payload = { email: "user8@email.com"}
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      await request.default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        })

      return userRepository.findOneBy({ email: "user8@email.com" }).then((user) => {
        expect(user.verified).toEqual(true);
      })
    });

    it("should not confirm account if user with given token not exist in database", () => {
      const payload = { email: "user80@email.com"}
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      return request.default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        })
    });

    it("should not confirm user account if user for given token is already confirmed", () => {
      const payload = { email: "user1@email.com"}
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      return request.default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        })
    });

    it("should not confirm user account if given token is not valid", () => {
      return request.default(app.getHttpServer())
        .get("/auth/confirmation/someToken")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        })
    });

    it("should not confirm user account if given token is expired", () => {
      const payload = { email: "user1@email.com"}
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: "-10s",
      });

      return request.default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        })
    });
  });

  describe("/auth/resend-confirmation/ (POST) - resend confirmation link", () => {
    it("should resend confirmation link if email exist in database", () => {
      return request.default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({email: "user8@email.com"})
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        })
    });

    it("should not resend confirmation link if email not exist in database", () => {
      return request.default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({email: "user80@email.com"})
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        })
    });
  });

  describe("/auth (POST) - login user", () => {
    it("should login user", async() => {
      const user ={ email: 'user1@email.com', password: 'QWERTqwert1!' }
      await request.default(app.getHttpServer())
        .post("/auth")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken.length).toBeDefined();
        })

      return userRepository.findOneBy({email: user.email}).then((user) => {
        expect(user.refreshTokens.length).toEqual(1);
      })
    });
    it("should not login user if email not exist in database", () => {});
    it("should not login user if password is incorrect", () => {});
    it("should not login user if email is not verified", () => {});
  });

  // describe("/auth (PATCH) - logout user ", () => {
  //   it("should logout user", () => {});
  // });

  // describe("/auth/tokens (PATCH) - get new tokens ", () => {
  //   it("should get new tokens", () => {});
  // });
});
