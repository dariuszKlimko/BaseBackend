import { Test, TestingModule } from "@nestjs/testing";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { User } from "@app/entities/user.entity";
import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { VerificationCode } from "@app/common/types/type/verificationCode";
import { Role } from "@app/common/types/enum/role.enum";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { DataSource } from "typeorm";

describe("UserService", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let userService: UserServiceIntrface;
  let userRepository: UserRepositoryIntrface;
  let dataSource: DataSource;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = moduleFixture.get<UserServiceIntrface>(UserService);
    userRepository = moduleFixture.get<UserRepositoryIntrface>(UserRepository);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("userService should be defined", () => {
    expect(userService).toBeDefined();
  });
  it("userRepository should be defined", () => {
    expect(userRepository).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("updateVerificationCode()", () => {
    it("should update VerificationCode for given user id", async () => {
      const user: User = fixtures.get("user62");
      const code: VerificationCode = {
        verificationCode: 654321,
      };
      await userService.updateVerificationCode(user.id, code);
      const result: User = await userRepository.findOneByIdOrThrow(user.id);
      return expect(result.verificationCode).toEqual(code.verificationCode);
    });
  });

  describe("updateRole()", () => {
    it("should update user's role", async () => {
      const user: User = fixtures.get("user62");
      const role: Role.Admin_1 | Role.Admin_2 = Role.Admin_1;
      await userService.updateRole(user.id, role);
      const result: User = await userRepository.findOneByIdOrThrow(user.id);
      return expect(result.role).toEqual(role);
    });
  });

  describe("registerUser()", () => {
    it("should return exception if user already exist", async () => {
      const user: User = fixtures.get("user62");
      const userToRegister: CreateUserDto = {
        email: user.email,
        password: user.password,
      };
      return await expect(userService.registerUser(userToRegister)).rejects.toThrow(UserDuplicatedException);
    });

    it(" should create user", async () => {
      const userToRegister: CreateUserDto = {
        email: faker.internet.email(),
        password: "Qwert12345!",
      };
      const result: User = await userService.registerUser(userToRegister);
      const res: User = await userRepository.findOneByConditionOrThrow({ email: userToRegister.email });
      expect(result.email).toEqual(res.email);
      return expect(result.email).toEqual(userToRegister.email);
    });

    it("should create user by admin", async () => {
      const userToRegisterByAdmin: CreateUserByAdminDto = {
        email: faker.internet.email(),
        password: "Qwert12345!",
        role: Role.Admin_1,
        verified: true,
      };
      const result: User = await userService.registerUser(userToRegisterByAdmin);
      const res: User = await userRepository.findOneByConditionOrThrow({ email: userToRegisterByAdmin.email });
      expect(result.email).toEqual(res.email);
      expect(result.role).toEqual(res.role);
      expect(result.verified).toEqual(res.verified);
      return expect(result.email).toEqual(userToRegisterByAdmin.email);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
