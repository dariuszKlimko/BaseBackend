import { Test, TestingModule } from "@nestjs/testing";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { User } from "@app/entities/user.entity";
import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/user.already.confirmed.exception";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { AuthService } from "@app/services/auth.service";
import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { PASSWORD_RESET_RESPONSE, USER_VERIFIED_RESPONSE } from "@app/common/constans/constans";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalid.verification.code.exception";
import { UpdateCredentialsDto } from "@app/dtos/auth/update.creadentials.dto";
import { DataSource } from "typeorm";

describe("AuthService", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let authService: AuthServiceIntrface;
  let userRepository: UserRepositoryIntrface;
  let dataSource: DataSource;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleFixture.get<AuthServiceIntrface>(AuthService);
    userRepository = moduleFixture.get<UserRepositoryIntrface>(UserRepository);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("authService should be defined", () => {
    expect(authService).toBeDefined();
  });
  it("userRepository should be defined", () => {
    expect(userRepository).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("userConfirmation()", () => {
    it("should return exception if user already confirmed", async () => {
      const user: User = fixtures.get("user62");
      return await expect(authService.userConfirmation(user.email)).rejects.toThrow(UserAlreadyConfirmedException);
    });

    it("should verified user", async () => {
      const user: User = fixtures.get("user63");
      const result: MessageInfo = await authService.userConfirmation(user.email);
      const res: User = await userRepository.findOneByConditionOrThrow({ email: user.email });
      expect(result.message).toEqual(USER_VERIFIED_RESPONSE.message);
      return expect(res.verified).toEqual(true);
    });
  });

  describe("comparePassword()", () => {
    it("should not authenticate user if wrong email", async () => {
      const user: User = fixtures.get("user64");
      const userInfo: CreateUserDto = {
        email: faker.internet.email(),
        password: user.password,
      };
      return await expect(authService.comparePassword(userInfo)).rejects.toThrow(EntityNotFound);
    });

    it("should not authenticate user if wrong password", async () => {
      const user: User = fixtures.get("user64");
      const userInfo: CreateUserDto = {
        email: user.email,
        password: "Qqqqwert12345!",
      };
      return await expect(authService.comparePassword(userInfo)).rejects.toThrow(UserAuthenticateException);
    });

    it("should authenticate user", async () => {
      const user: User = fixtures.get("user64");
      const userInfo: CreateUserDto = {
        email: user.email,
        password: "Qwert12345!",
      };
      const result: User = await authService.comparePassword(userInfo);
      const isMatch: boolean = await result.validatePassword(userInfo.password);
      expect(isMatch).toEqual(true);
      expect(result.id).toEqual(user.id);
      return expect(result.email).toEqual(user.email);
    });
  });

  describe("resetPasswordConfirm()", () => {
    it("should return exception if invalid verificationCode", async () => {
      const user: User = fixtures.get("user65");
      const resetPassord: ResetPasswordDto = {
        email: user.email,
        password: "Qwert12345!",
        verificationCode: 654321,
      };
      return await expect(authService.resetPasswordConfirm(resetPassord)).rejects.toThrow(
        InvalidVerificationCodeException
      );
    });

    it("should reset password", async () => {
      const user: User = fixtures.get("user65");
      const resetPassord: ResetPasswordDto = {
        email: user.email,
        password: "Qwert1234555!",
        verificationCode: 123456,
      };
      const result: MessageInfo = await authService.resetPasswordConfirm(resetPassord);
      const res: User = await userRepository.findOneByIdOrThrow(user.id);
      const isMatch: boolean = await res.validatePassword(resetPassord.password);
      expect(isMatch).toEqual(true);
      expect(result.message).toEqual(PASSWORD_RESET_RESPONSE.message);
      return expect(result.status).toEqual(PASSWORD_RESET_RESPONSE.status);
    });
  });

  describe("updateCredentials()", () => {
    it("should update user email", async () => {
      const user: User = fixtures.get("user66");
      const credentials: UpdateCredentialsDto = {
        email: "user66_1@email.com",
      };
      const result: User = await authService.updateCredentials(user.id, credentials);
      return expect(result.email).toEqual(credentials.email);
    });

    it("should update user passord", async () => {
      const user: User = fixtures.get("user66");
      const credentials: UpdateCredentialsDto = {
        password: "Qwert12345555!",
      };
      const result: User = await authService.updateCredentials(user.id, credentials);
      const isMatch: boolean = await result.validatePassword(credentials.password);
      return expect(isMatch).toEqual(true);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
