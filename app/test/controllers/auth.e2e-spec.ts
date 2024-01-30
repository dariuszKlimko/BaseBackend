import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures from "@test/helpers/load.fixtures";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "@app/dtos/auth/login.response";
import { userLogin } from "@test/helpers/user.login";
import { credentialsUpdate } from "@test/helpers/credentials.update";
import { jwtGenerate } from "@test/helpers/jwt.generate";
import { UserRepository } from "@app/repositories/user.repository";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let configService: ConfigService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let tokenSecret: string;
  let tokenExpireTime: number;

  let auth8Tokens: LoginResponse;
  let auth9Tokens: LoginResponse;
  let auth10Tokens: LoginResponse;
  let auth11Tokens: LoginResponse;
  let auth12Tokens: LoginResponse;
  let auth13Tokens: LoginResponse;
  let auth14Tokens: LoginResponse;
  let auth15Tokens: LoginResponse;

  beforeAll(async () => {
    await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ConfigService, JwtService],
    }).compile();

    jwtService = moduleFixture.get(JwtService);
    configService = moduleFixture.get(ConfigService);
    userRepository = moduleFixture.get(UserRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    tokenSecret = configService.get("JWT_CONFIRMATION_TOKEN_SECRET");
    tokenExpireTime = configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME");

    auth8Tokens = await userLogin("auth8@email.com", "Qwert12345!", app).then((res) => res.body);
    auth9Tokens = await userLogin("auth9@email.com", "Qwert12345!", app).then((res) => res.body);
    auth10Tokens = await userLogin("auth10@email.com", "Qwert12345!", app).then((res) => res.body);
    auth11Tokens = await userLogin("auth11@email.com", "Qwert12345!", app).then((res) => res.body);
    auth12Tokens = await userLogin("auth12@email.com", "Qwert12345!", app).then((res) => res.body);
    auth13Tokens = await userLogin("auth13@email.com", "Qwert12345!", app).then((res) => res.body);
    auth14Tokens = await userLogin("auth14@email.com", "Qwert12345!", app).then((res) => res.body);
    auth15Tokens = await userLogin("auth15@email.com", "Qwert12345!", app).then((res) => res.body);
  });

  describe("/auth/confirmation/:token (GET) - confirm user account", () => {
    it("should confirm user account in database if token is valid", async () => {
      const token = jwtGenerate("auth1@email.com", tokenSecret, tokenExpireTime, jwtService);
      await request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });

      return await userRepository
        .findOpenQuery({
          where: { email: "auth1@email.com" },
        })
        .then(([users]) => {
          expect(users[0].verified).toEqual(true);
        });
    });

    it("should not confirm account if user with given token not exist in database", async () => {
      const token = jwtGenerate("authNotExistInDb@email.com", tokenSecret, tokenExpireTime, jwtService);
      return await request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });

    it("should not confirm user account if user for given token is already confirmed", async () => {
      const token = jwtGenerate("auth2@email.com", tokenSecret, tokenExpireTime, jwtService);
      return await request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not confirm user account if given token is not valid", async () => {
      return await request
        .default(app.getHttpServer())
        .get("/auth/confirmation/someToken")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not confirm user account if given token is expired", async () => {
      const token = jwtGenerate("auth3@email.com", tokenSecret, -10, jwtService);
      return await request
        .default(app.getHttpServer())
        .get(`/auth/confirmation/${token}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth/resend-confirmation/ (POST) - resend confirmation link", () => {
    it("should resend confirmation link if email exist in database", async () => {
      return await request
        .default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({ email: "auth4@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });
    });

    it("should not resend confirmation link if email not exist in database", async () => {
      return await request
        .default(app.getHttpServer())
        .post("/auth/resend-confirmation")
        .send({ email: "authNotExistInDb@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });
  });

  describe("/auth (POST) - login user", () => {
    it("should return tokens", async () => {
      const user = { email: "auth5@email.com", password: "Qwert12345!" };
      await request
        .default(app.getHttpServer())
        .post("/auth/login")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });

      return await userRepository
        .findOpenQuery({
          where: { email: user.email },
        })
        .then(([users]) => {
          expect(users[0].refreshTokens.length).toEqual(1);
        });
    });

    it("should login one user twice", async () => {
      const user = { email: "auth16@email.com", password: "Qwert12345!" };
      await request
        .default(app.getHttpServer())
        .post("/auth/login")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });

      await request
        .default(app.getHttpServer())
        .post("/auth/login")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });

      return await userRepository
        .findOpenQuery({
          where: { email: user.email },
        })
        .then(([users]) => {
          expect(users[0].refreshTokens.length).toEqual(2);
        });
    });

    it("should not return tokens if email not exist in database", async () => {
      const user = { email: "authNotExistInDb@email.com", password: "QWERTqwert1!" };
      return await request
        .default(app.getHttpServer())
        .post("/auth/login")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });

    it("should not return tokens if password is incorrect", async () => {
      const user = { email: "auth6@email.com", password: "Qwert123456789!" };
      return await request
        .default(app.getHttpServer())
        .post("/auth/login")
        .send(user)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        });
    });

    it("should not return tokens if email is not verified", async () => {
      const user = { email: "auth7@email.com", password: "Qwert12345!" };
      return await request
        .default(app.getHttpServer())
        .post("/auth/login")
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
        .patch("/auth/logout")
        .set("Authorization", `Bearer ${auth8Tokens.accessToken}`)
        .send({ refreshToken: auth8Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.email).toEqual("auth8@email.com");
        });

      return await userRepository.findOpenQuery({ where: { email: "auth8@email.com" } }).then(([users]) => {
        expect(users[0].refreshTokens).toEqual([]);
      });
    });

    it("should not delete refresh token for user with given accessToken which is not owner of refreshToken", async () => {
      return await request
        .default(app.getHttpServer())
        .patch("/auth/logout")
        .set("Authorization", `Bearer ${auth9Tokens.accessToken}`)
        .send({ refreshToken: auth10Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

    it("should not delete refresh token for user with given accessToken if resreshToken not exist in database", async () => {
      return await request
        .default(app.getHttpServer())
        .patch("/auth/logout")
        .set("Authorization", `Bearer ${auth11Tokens.accessToken}`)
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
        .send({ refreshToken: auth12Tokens.refreshToken })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken.length).toBeDefined();
        });

      return await userRepository.findOpenQuery({ where: { email: "auth12@email.com" } }).then(([users]) => {
        expect(users[0].refreshTokens.length).toEqual(1);
      });
    });

    it("should not get new tokens if invalid refreshToken", async () => {
      return await request
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
      await credentialsUpdate(auth13Tokens.accessToken, { email: "authUpdate13@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("authUpdate13@email.com");
      });

      return await userRepository
        .findOpenQuery({
          where: { email: "authUpdate13@email.com" },
        })
        .then(([users]) => {
          expect(users[0].email).toEqual("authUpdate13@email.com");
        });
    });

    it("should not update user if email is not email", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { email: "authUpdate14email.com" }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
      );
    });

    it("should update user password for user with given accessToken", async () => {
      return await credentialsUpdate(auth15Tokens.accessToken, { password: "Qwerty123456!" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
      });
    });

    it("should not update user password shorter than 8 characters", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { password: "Qw12!" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password longer than 24 characters", async () => {
      return await credentialsUpdate(
        auth14Tokens.accessToken,
        { password: "QwrtfgvbcfrewqwerQQW229disj12!" },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without number", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { password: "Qwertyjhgfjgf!" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without special character", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { password: "Qwerty123456" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without capital letter", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { password: "qwerty123456!" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without small letter", async () => {
      return await credentialsUpdate(auth14Tokens.accessToken, { password: "QWERTY123456!" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/auth/reset-password (PATCH) - send verification code ", () => {
    it("should send email with verification code", async () => {
      await request
        .default(app.getHttpServer())
        .patch("/auth/reset-password")
        .send({ email: "auth17@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });

      return await userRepository
        .findOpenQuery({
          where: { email: "auth17@email.com" },
        })
        .then(([users]) => {
          expect(users[0].verificationCode).toBeDefined();
          expect(users[0].verificationCode).toBeGreaterThanOrEqual(100000);
          expect(users[0].verificationCode).toBeLessThanOrEqual(999999);
        });
    });

    it("should not send email with verification code if user not exist in database", async () => {
      return await request
        .default(app.getHttpServer())
        .patch("/auth/reset-password")
        .send({ email: "authNotExistInDb@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        });
    });

    it("should not send email with verification code if user is not verified", async () => {
      return await request
        .default(app.getHttpServer())
        .patch("/auth/reset-password")
        .send({ email: "auth18@email.com" })
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
  });

  describe("/auth/reset-password-confirm (PATCH) - reset user password with verification code ", () => {
    it("should reset password with valid verification code", async () => {
      const resetPassord = {
        email: "auth19@email.com",
        password: "Qwerty123456!",
        verificationCode: 123456,
      };
      await request
        .default(app.getHttpServer())
        .patch("/auth/reset-password-confirm")
        .send(resetPassord)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.status).toEqual("ok");
        });

      await userLogin("auth19@email.com", "Qwerty123456!", app).then((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });

      return await userRepository
        .findOpenQuery({
          where: { email: "auth19@email.com" },
        })
        .then(([users]) => {
          expect(users[0].verificationCode).toEqual(null);
        });
    });

    it("should not reset password with invalid verification code", async () => {
      const resetPassord = {
        email: "auth20@email.com",
        password: "Qwerty123456!",
        verificationCode: 777777,
      };
      await request
        .default(app.getHttpServer())
        .patch("/auth/reset-password-confirm")
        .send(resetPassord)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        });

      return await userRepository
        .findOpenQuery({
          where: { email: "auth20@email.com" },
        })
        .then(([users]) => {
          expect(users[0].verificationCode).toEqual(123456);
        });
    });
  });
});
