import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "@app/dtos/auth/login.response";
import { UserRepository } from "@app/repositories/user.repository";
import { patchCRUD, postCRUD } from "@test/helpers/crud/crud";
import { patchAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import cookieParser from "cookie-parser";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { GeneratorSevice } from "@app/services/generator.service";
import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let dataSource: DataSource;
  let configService: ConfigService;
  let jwtService: JwtService;
  let userRepository: UserRepositoryIntrface;
  let generatorService: GeneratorServiceIntrface;

  let auth21Tokens: LoginResponse;
  let auth22Tokens: LoginResponse;
  let auth26Tokens: LoginResponse;
  let auth28Tokens: LoginResponse;
  let admin0_12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
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

    auth21Tokens = await postCRUD("/auth/login", { email: "auth21@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth22Tokens = await postCRUD("/auth/login", { email: "auth22@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth26Tokens = await postCRUD("/auth/login", { email: "auth26@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    auth28Tokens = await postCRUD("/auth/login", { email: "auth28@email.com", password: "Qwert12345!" }, app).then(
      (res) => res.body
    );
    admin0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
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

  describe("/auth/logoutc (PATCH) - logout user", () => {
    it("should delete refresh token for user with given accessToken and refreshToken", async () => {
      const cookie: string = `refreshToken=${auth22Tokens.refreshToken}`;
      await patchAuthCRUD("/auth/logoutc", auth22Tokens.accessToken, null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("auth22@email.com");
      });
      return await userRepository.findOneByConditionOrThrow({ email: "auth22@email.com" }).then((users) => {
        expect(users.refreshTokens.length).toEqual(2);
      });
    });

    it("should not delete refresh token for user with given accessToken which is not owner of refreshToken", async () => {
      const cookie: string = `refreshToken=${auth22Tokens.refreshToken}`;
      await patchAuthCRUD("/auth/logoutc", auth21Tokens.accessToken, null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not delete refresh token for user with given accessToken if resreshToken not exist in database", async () => {
      const cookie: string = "refreshToken=rongrefreshToken";
      await patchAuthCRUD("/auth/logoutc", auth22Tokens.accessToken, null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not delete refresh token for user with given accessToken if wrong signed jwt accessToken", async () => {
      const cookie: string = `refreshToken=${auth22Tokens.refreshToken}`;
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await patchAuthCRUD("/auth/logoutc", accessToken, null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete refresh token for user with given accessToken for not jwt accessToken", async () => {
      const cookie: string = `refreshToken=${auth22Tokens.refreshToken}`;
      return await patchAuthCRUD("/auth/logoutc", "someToken", null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/auth/tokensc (PATCH) - get new tokens", () => {
    it("should get new tokens", async () => {
      const cookie: string = `refreshToken=${auth21Tokens.refreshToken}`;
      let refreshToken: string;
      await patchCRUD("/auth/tokensc", null, app, cookie).then((res) => {
        refreshToken = res.header["set-cookie"][0];
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.accessToken).toBeDefined();
        expect(res.header["set-cookie"][0]).toBeDefined();
      });
      refreshToken = refreshToken.substring(refreshToken.indexOf("=") + 1, refreshToken.indexOf(";"));
      return await userRepository.findOneByConditionOrThrow({ email: "auth21@email.com" }).then((users) => {
        expect(users.refreshTokens[0]).toEqual(refreshToken);
      });
    });

    it("should not get new tokens if invalid refreshToken", async () => {
      const cookie: string = "refreshToken=invalidRefreshToken";
      await patchCRUD("/auth/tokensc", null, app, cookie).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/auth/forcelogout (PATCH) - forcelogout user", () => {
    it("should delete all refresh tokens for user with given accessToken", async () => {
      await patchAuthCRUD("/auth/forcelogout", auth26Tokens.accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("auth26@email.com");
      });

      return await userRepository.findOneByConditionOrThrow({ email: "auth26@email.com" }).then((user) => {
        expect(user.refreshTokens).toEqual([]);
      });
    });

    it("should not delete all refresh tokens for user with given accessToken if is not jwt", async () => {
      return await patchAuthCRUD("/auth/forcelogout", "someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete all refresh tokens for user with given accessToken if user not exist in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      return await patchAuthCRUD("/auth/forcelogout", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not delete all refresh tokens for user with given accessToken if is wrong signed", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await patchAuthCRUD("/auth/forcelogout", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("forcelogoutbyadmin/:userid (PATCH) - forcelogout user by admin", () => {
    it("should delete all refresh tokens for given userId by admin_0", async () => {
      await patchAuthCRUD(
        `/auth/forcelogoutbyadmin/${fixtures.get("user58").id}`,
        admin0_12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("auth27@email.com");
      });

      return await userRepository.findOneByConditionOrThrow({ email: "auth27@email.com" }).then((user) => {
        expect(user.refreshTokens).toEqual([]);
      });
    });

    it("should not delete all refresh tokens for given not uuid userId by admin_0", async () => {
      await patchAuthCRUD("/auth/forcelogoutbyadmin/notUuid", admin0_12accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not delete all refresh tokens for given not existed userId by admin_0", async () => {
      await patchAuthCRUD(`/auth/forcelogoutbyadmin/${faker.string.uuid()}`, admin0_12accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });

    it("should not delete all refresh tokens for given userId by normal user", async () => {
      await patchAuthCRUD(
        `/auth/forcelogoutbyadmin/${fixtures.get("user59").id}`,
        auth28Tokens.accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete all refresh tokens for given userId by not jwt token", async () => {
      await patchAuthCRUD(`/auth/forcelogoutbyadmin/${fixtures.get("user59").id}`, "someToken", null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not delete all refresh tokens for given userId by not jwt token", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      await patchAuthCRUD(`/auth/forcelogoutbyadmin/${fixtures.get("user59").id}`, accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not delete all refresh tokens for given userId by not existed", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      await patchAuthCRUD(`/auth/forcelogoutbyadmin/${fixtures.get("user59").id}`, accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
