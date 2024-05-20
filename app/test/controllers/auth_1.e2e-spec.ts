import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "@app/dtos/auth/login.response";
import { jwtGenerate } from "@test/helpers/jwt.generate";
import { UserRepository } from "@app/repositories/user.repository";
import { getCRUD, patchCRUD, postCRUD } from "@test/helpers/crud/crud";
import { BodyCRUD } from "@test/helpers/types/body";
import { patchAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import cookieParser from "cookie-parser";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { GeneratorSevice } from "@app/services/generator.service";
import { DataSource } from "typeorm";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let configService: ConfigService;
  let jwtService: JwtService;
  let userRepository: UserRepositoryIntrface;
  let generatorService: GeneratorServiceIntrface;
  let tokenSecret: string;
  let tokenExpireTime: number;

  let auth8Tokens: LoginResponse;
  let auth9Tokens: LoginResponse;
  let auth10Tokens: LoginResponse;
  let auth11Tokens: LoginResponse;
  let auth12Tokens: LoginResponse;
  let auth14Tokens: LoginResponse;
  let auth15Tokens: LoginResponse;
  let auth70Tokens: LoginResponse;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    userRepository = moduleFixture.get<UserRepositoryIntrface>(UserRepository);
    generatorService = moduleFixture.get<GeneratorServiceIntrface>(GeneratorSevice);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();

    tokenSecret = configService.get("JWT_CONFIRMATION_TOKEN_SECRET");
    tokenExpireTime = configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME");

    auth8Tokens = await postCRUD("/auth/login", { email: "auth8@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth9Tokens = await postCRUD("/auth/login", { email: "auth9@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth10Tokens = await postCRUD("/auth/login", { email: "auth10@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth11Tokens = await postCRUD("/auth/login", { email: "auth11@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth12Tokens = await postCRUD("/auth/login", { email: "auth12@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth14Tokens = await postCRUD("/auth/login", { email: "auth14@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth15Tokens = await postCRUD("/auth/login", { email: "auth15@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );

    auth70Tokens = await postCRUD("/auth/login", { email: "user70@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
  });

  it("jwtService should be defined", () => {
    expect(jwtService).toBeDefined();
  });
  it("configService should be defined", () => {
    expect(configService).toBeDefined();
  });
  it("userRepository should be defined", () => {
    expect(userRepository).toBeDefined();
  });
  it("generatorService should be defined", () => {
    expect(generatorService).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("/auth/confirmation/:token (GET) - confirm user account", () => {
    it("should confirm user account in database if token is valid", async () => {
      const token: string = jwtGenerate("auth1@email.com", tokenSecret, tokenExpireTime, jwtService);
      await getCRUD(`/auth/confirmation/${token}`, null, app).then((res) => {
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
      const token: string = jwtGenerate("authNotExistInDb@email.com", tokenSecret, tokenExpireTime, jwtService);
      return await getCRUD(`/auth/confirmation/${token}`, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not confirm user account if user for given token is already confirmed", async () => {
      const token: string = jwtGenerate("auth2@email.com", tokenSecret, tokenExpireTime, jwtService);
      return await getCRUD(`/auth/confirmation/${token}`, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not confirm user account if given token is not valid", async () => {
      return await getCRUD("/auth/confirmation/someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not confirm user account if given token is expired", async () => {
      const token: string = jwtGenerate("auth3@email.com", tokenSecret, -10, jwtService);
      return await getCRUD(`/auth/confirmation/${token}`, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/auth/resend-confirmation/ (POST) - resend confirmation link", () => {
    it("should resend confirmation link if email exist in database", async () => {
      return await postCRUD("/auth/resend-confirmation", { email: "auth4@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.status).toEqual("ok");
      });
    });

    it("should not resend confirmation link if email not exist in database", async () => {
      return await postCRUD("/auth/resend-confirmation", { email: "authNotExistInDb@email.com" }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });

    it("should not resend confirmation link if external provider", async () => {
      return await postCRUD("/auth/resend-confirmation", { email: "user70@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/login (POST) - login user", () => {
    it("should return tokens", async () => {
      const user: BodyCRUD = { email: "auth5@email.com", password: "Qwert12345!" };
      await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });

      return await userRepository
        .findOpenQuery({
          where: { email: String(user.email) },
        })
        .then(([users]) => {
          expect(users[0].refreshTokens.length).toEqual(1);
        });
    });

    it("should login one user twice", async () => {
      const user: BodyCRUD = { email: "auth16@email.com", password: "Qwert12345!" };
      await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });

      await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });

      return await userRepository
        .findOpenQuery({
          where: { email: String(user.email) },
        })
        .then(([users]) => {
          expect(users[0].refreshTokens.length).toEqual(2);
        });
    });

    it("should not return tokens if email not exist in database", async () => {
      const user: BodyCRUD = { email: "authNotExistInDb@email.com", password: "QWERTqwert1!" };
      return await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return tokens if password is incorrect", async () => {
      const user: BodyCRUD = { email: "auth6@email.com", password: "Qwert123456789!" };
      return await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return tokens if email is not verified", async () => {
      const user: BodyCRUD = { email: "auth7@email.com", password: "Qwert12345!" };
      return await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not return tokens if external provider", async () => {
      const user: BodyCRUD = { email: "user70@email.com", password: "Qwert12345!" };
      return await postCRUD("/auth/login", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/logout (PATCH) - logout user", () => {
    it("should delete refresh token for user with given accessToken and refreshToken", async () => {
      await patchAuthCRUD(
        "/auth/logout",
        auth8Tokens.accessToken,
        { refreshToken: auth8Tokens.refreshToken },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("auth8@email.com");
      });

      return await userRepository.findOpenQuery({ where: { email: "auth8@email.com" } }).then(([users]) => {
        expect(users[0].refreshTokens).toEqual([]);
      });
    });

    it("should not delete refresh token for user with given accessToken which is not owner of refreshToken", async () => {
      return await patchAuthCRUD(
        "/auth/logout",
        auth9Tokens.accessToken,
        { refreshToken: auth10Tokens.refreshToken },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not delete refresh token for user with given accessToken if resreshToken not exist in database", async () => {
      return await patchAuthCRUD(
        "/auth/logout",
        auth11Tokens.accessToken,
        { refreshToken: "someToken" },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/auth/tokens (PATCH) - get new tokens", () => {
    it("should get new tokens", async () => {
      await patchCRUD("/auth/tokens", { refreshToken: auth12Tokens.refreshToken }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken.length).toBeDefined();
      });

      return await userRepository.findOpenQuery({ where: { email: "auth12@email.com" } }).then(([users]) => {
        expect(users[0].refreshTokens.length).toEqual(1);
      });
    });

    it("should not get new tokens if invalid refreshToken", async () => {
      return await patchCRUD("/auth/tokens", { refreshToken: "someToken" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/auth/password (PATCH) - update user email and password ", () => {
    it("should not update password if email is not email", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "authUpdate14email.com",
          password: "Qwert12345!",
          newPassword: "Qwert123456!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should update user password for user with given accessToken", async () => {
      await patchAuthCRUD(
        "/auth/password",
        auth15Tokens.accessToken,
        {
          email: "auth15@email.com",
          password: "Qwert12345!",
          newPassword: "Qwert123456!",
        },
        app
      ).then(async (res) => {
        expect(res.status).toEqual(HttpStatus.OK);
      });
      const authUser: User = await userRepository.findOneByConditionOrThrow({ email: "auth15@email.com" });
      return expect(await authUser.validatePassword("Qwert123456!")).toBe(true);
    });

    it("should not update user password shorter than 8 characters", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "Qw12!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password longer than 24 characters", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "QwrtfgvbcfrewqwerQQW229disj12!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without number", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "Qwertyjhgfjgf!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without special character", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "Qwerty123456",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without capital letter", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "qwerty123456!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password without small letter", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth14Tokens.accessToken,
        {
          email: "auth14@email.com",
          password: "Qwert12345!",
          newPassword: "QWERTY123456!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user password if external provider", async () => {
      return await patchAuthCRUD(
        "/auth/password",
        auth70Tokens.accessToken,
        {
          email: "user70@email.com",
          password: "Qwert12345!",
          newPassword: "QWERTY123456!",
        },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/reset-password (PATCH) - send verification code ", () => {
    it("should send email with verification code", async () => {
      await patchCRUD("/auth/reset-password", { email: "auth17@email.com" }, app).then((res) => {
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
      return await patchCRUD("/auth/reset-password", { email: "authNotExistInDb@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not send email with verification code if user is not verified", async () => {
      return await patchCRUD("/auth/reset-password", { email: "auth18@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not send email with verification code if external provider", async () => {
      return await patchCRUD("/auth/reset-password", { email: "user70@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/reset-password-confirm (PATCH) - reset user password with verification code ", () => {
    it("should reset password with valid verification code", async () => {
      const resetPassowrd: BodyCRUD = {
        email: "auth19@email.com",
        password: "Qwerty123456!",
        verificationCode: 123456,
      };
      await patchCRUD("/auth/reset-password-confirm", resetPassowrd, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.status).toEqual("ok");
      });

      await postCRUD("/auth/login", { email: "auth19@email.com", password: "Qwerty123456!" }, app).then((res) => {
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
      const resetPassowrd: BodyCRUD = {
        email: "auth20@email.com",
        password: "Qwerty123456!",
        verificationCode: 777777,
      };
      await patchCRUD("/auth/reset-password-confirm", resetPassowrd, app).then((res) => {
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

    it("should not reset password if user is not verified", async () => {
      const resetPassword: BodyCRUD = {
        email: "auth18@email.com",
        password: "Qwerty123456!",
        verificationCode: 777777,
      };
      return await patchCRUD("/auth/reset-password-confirm", resetPassword, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not reset password if user is not verified", async () => {
      const resetPassword: BodyCRUD = {
        email: "user70@email.com",
        password: "Qwerty123456!",
        verificationCode: 777777,
      };
      return await patchCRUD("/auth/reset-password-confirm", resetPassword, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/loginc (POST) - login user with cookies", () => {
    it("should return tokens", async () => {
      const user: BodyCRUD = { email: "auth23@email.com", password: "Qwert12345!" };
      let refreshToken: string;
      await postCRUD("/auth/loginc", user, app).then((res) => {
        refreshToken = res.header["set-cookie"][0];
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.header["set-cookie"][0]).toBeDefined();
      });

      refreshToken = refreshToken.substring(refreshToken.indexOf("=") + 1, refreshToken.indexOf(";"));
      return await userRepository.findOneByConditionOrThrow({ email: String(user.email) }).then((user) => {
        expect(user.refreshTokens[0]).toEqual(refreshToken);
      });
    });

    it("should login one user twice", async () => {
      const user: BodyCRUD = { email: "auth24@email.com", password: "Qwert12345!" };
      await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.header["set-cookie"][0]).toBeDefined();
      });

      await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.accessToken).toBeDefined();
        expect(res.header["set-cookie"][0]).toBeDefined();
      });

      return await userRepository.findOneByConditionOrThrow({ email: String(user.email) }).then((user) => {
        expect(user.refreshTokens.length).toEqual(2);
      });
    });

    it("should not return tokens if email not exist in database", async () => {
      const user: BodyCRUD = { email: "authNotExistInDb@email.com", password: "Qwert12345!" };
      await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return tokens if password is incorrect", async () => {
      const user: BodyCRUD = { email: "auth25@email.com", password: "Qwert123456789!" };
      return await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return tokens if email is not verified", async () => {
      const user: BodyCRUD = { email: "auth7@email.com", password: "Qwert12345!" };
      return await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not return tokens if external provider", async () => {
      const user: BodyCRUD = { email: "user70@email.com", password: "Qwert12345!" };
      return await postCRUD("/auth/loginc", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
