import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { LoginResponse } from "@app/modules/auth/types/login-response";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let configService: ConfigService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let user4Tokens: LoginResponse;
  let user5Tokens: LoginResponse;

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

    user5Tokens = await request
      .default(app.getHttpServer())
      .post("/auth")
      .send({ email: "user5@email.com", password: "QWERTqwert5!" })
      .then((res) => res.body);

    user4Tokens = await request
      .default(app.getHttpServer())
      .post("/auth")
      .send({ email: "user4@email.com", password: "QWERTqwert4!" })
      .then((res) => res.body);
  });

  describe("/auth/confirmation/:token (GET) - confirm user account", () => {
    it("should confirm user account in database if token is valid", async () => {
      const payload = { email: "user8@email.com" };
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      await request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });

      return userRepository.findOneBy({ email: "user8@email.com" }).then((user) => {
        expect(user.verified).toEqual(true);
      });
    });

    it("should not confirm account if user with given token not exist in database", () => {
      const payload = { email: "user80@email.com" };
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      return request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });

    it("should not confirm user account if user for given token is already confirmed", () => {
      const payload = { email: "user1@email.com" };
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });

      return request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not confirm user account if given token is not valid", () => {
      return request
        .default(app.getHttpServer())
        .get("/auth/confirmation/someToken")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not confirm user account if given token is expired", () => {
      const payload = { email: "user1@email.com" };
      const token = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: "-10s",
      });

      return request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth/resend-confirmation/ (POST) - resend confirmation link", () => {
    it("should resend confirmation link if email exist in database", () => {
      return request
        .default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({ email: "user8@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });
    });

    it("should not resend confirmation link if email not exist in database", () => {
      return request
        .default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({ email: "user80@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });
  });

  describe("/auth (POST) - login user", () => {
    it("should return tokens", async () => {
      const user = { email: "user1@email.com", password: "QWERTqwert1!" };
      await request
        .default(app.getHttpServer())
        .post("/auth")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken.length).toBeDefined();
        });

      return userRepository.findOneBy({ email: user.email }).then((user) => {
        expect(user.refreshTokens.length).toEqual(1);
      });
    });

    it("should not return tokens if email not exist in database", () => {
      const user = { email: "user80@email.com", password: "QWERTqwert1!" };
      return request
        .default(app.getHttpServer())
        .post("/auth")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });

    it("should not return tokens if password is incorrect", () => {
      const user = { email: "user1@email.com", password: "QWERTqwert11!" };
      return request
        .default(app.getHttpServer())
        .post("/auth")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        });
    });

    it("should not return tokens if email is not verified", () => {
      const user = { email: "user8@email.com", password: "QWERTqwert8!" };
      return request
        .default(app.getHttpServer())
        .post("/auth")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth (PATCH) - logout user ", () => {
    it("should delete refresh token for user with given accessToken and refreshToken", async () => {
      await request
        .default(app.getHttpServer())
        .patch("/auth")
        .set("Authorization", `Bearer ${user5Tokens.accessToken}`)
        .send({ refreshToken: user5Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.email).toEqual("user5@email.com");
        });

      return userRepository.findOneBy({ email: "user5@email.com" }).then((user) => {
        expect(user.refreshTokens).toEqual([]);
      });
    });

    it("should not delete refresh token for user with given accessToken which is not owner of refreshToken", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ refreshToken: user5Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not delete refresh token for user with given accessToken if resreshToken not exist in database", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth")
        .set("Authorization", `Bearer ${user5Tokens.accessToken}`)
        .send({ refreshToken: "someToken" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth/tokens (PATCH) - get new tokens ", () => {
    it("should get new tokens", async () => {
      await request
        .default(app.getHttpServer())
        .patch("/auth/tokens")
        .send({ refreshToken: user5Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken.length).toBeDefined();
        });

      return userRepository.findOneBy({ email: "user5@email.com" }).then((user) => {
        expect(user.refreshTokens.length).toEqual(1);
      });
    });

    it("should not get new tokens if invalid refreshToken", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/tokens")
        .send({ refreshToken: "someToken" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth/credentials (PATCH) - update user email and password ", () => {
    it("should update user email for user with given accessToken", async () => {
      await request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ email: "test1@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.email).toEqual("test1@email.com");
        });

      return userRepository.findOneBy({ email: "test1@email.com" }).then((user) => {
        expect(user.email).toEqual("test1@email.com");
      });
    });

    it("should not update user if email is not email", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ email: "test1email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should update user password for user with given accessToken", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "Qwerty123456!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
        });
    });

    it("should not update user password shorter than 8 characters", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "Qw12!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not update user password longer than 24 characters", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "QwrtfgvbcfrewqwerQQW229disj12!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not update user password without number", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "Qwertyjhgfjgf!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not update user password without special character", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "Qwerty123456" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not update user password without capital letter", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "qwerty123456!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not update user password without small letter", () => {
      return request
        .default(app.getHttpServer())
        .patch("/auth/credentials")
        .set("Authorization", `Bearer ${user4Tokens.accessToken}`)
        .send({ password: "QWERTY123456!" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });
});
