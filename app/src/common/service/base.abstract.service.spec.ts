import { Test, TestingModule } from "@nestjs/testing";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { ProfileServiceIntrface } from "@app/common/types/interfaces/services/profile.service.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { ProfileService } from "@app/services/profile.service";
import { User } from "@app/entities/user.entity";
import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { DeepPartial, FindManyOptions, FindOptionsWhere, In, QueryFailedError, UpdateResult } from "typeorm";
import { VerificationCode } from "@app/common/types/type/verificationCode";
import { Role } from "@app/common/types/enum/role.enum";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";

describe("UserService", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let userService: UserServiceIntrface;
  let userRepository: UserRepositoryIntrface;
  let profileService: ProfileServiceIntrface;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = moduleFixture.get<UserServiceIntrface>(UserService);
    userRepository = moduleFixture.get<UserRepositoryIntrface>(UserRepository);
    profileService = moduleFixture.get<ProfileServiceIntrface>(ProfileService);

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
  it("profileService should be defined", () => {
    expect(profileService).toBeDefined();
  });

  describe("findAll()", () => {
    it("should return all users without pagination", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const result: [User[], number] = await userService.findAll();
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(users[0].length);
    });

    it("should return users with pagination", async () => {
      const skip: number = 0;
      const take: number = 10;
      const result: [User[], number] = await userService.findAll(skip, take);
      return expect(result[0].length).toEqual(take);
    });

    it("should return users with pagination when take = 0", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const skip: number = 0;
      const take: number = 0;
      const result: [User[], number] = await userService.findAll(skip, take);
      return expect(result[0].length).toEqual(users[1]);
    });

    it("should return users with pagination when take higher than array length", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const skip: number = 0;
      const take: number = users[1] + 10;
      const result: [User[], number] = await userService.findAll(skip, take);
      return expect(result[0].length).toEqual(users[1]);
    });

    it("should return users with pagination when skip higher than array length", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const skip: number = users[1] + 10;
      const take: number = 3;
      const result: [User[], number] = await userService.findAll(skip, take);
      return expect(result[0].length).toEqual(0);
    });
  });

  describe("findOneByIdOrThrow()", () => {
    it("should return user for given user id", async () => {
      const user: User = fixtures.get("user1");
      const result: User = await userService.findOneByIdOrThrow(user.id);
      expect(result.email).toEqual(user.email);
      return expect(result.id).toEqual(user.id);
    });

    it("should not return user for given user id", async () => {
      const id: string = faker.string.uuid();
      await expect(userService.findOneByIdOrThrow(id)).rejects.toThrow(EntityNotFound);
    });
  });

  describe("findOneByConditionOrThrow()", () => {
    it("should return user for given user email", async () => {
      const user: User = fixtures.get("user1");
      const result: User = await userService.findOneByConditionOrThrow({ email: user.email });
      expect(result.email).toEqual(user.email);
      return expect(result.id).toEqual(user.id);
    });

    it("should not return user for given user email", async () => {
      const email: string = faker.internet.email();
      return await expect(userService.findOneByConditionOrThrow({ email })).rejects.toThrow(EntityNotFound);
    });
  });

  describe("findAllByIds()", () => {
    it("should return users for given array of ids", async () => {
      const user1: User = fixtures.get("user1");
      const user2: User = fixtures.get("user2");
      const user3: User = fixtures.get("user3");
      const ids: string[] = [user1.id, user2.id, user3.id];
      const result: [User[], number] = await userService.findAllByIds(ids);
      expect(result[0].length).toEqual(ids.length);
      expect(result[0][0].id).toEqual(ids[0]);
      return expect(result[0][1].id).toEqual(ids[1]);
    });

    it("should return emty array for given array of not existed ids", async () => {
      const ids: string[] = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      const result: [User[], number] = await userService.findAllByIds(ids);
      return expect(result[0].length).toEqual(0);
    });
  });

  describe("findAllByCondition()", () => {
    it("should return user with verified = true", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const result: [User[], number] = await userService.findAllByCondition({ verified: true });
      expect(result[0][0].verified).toEqual(true);
      return expect(result[0].length).toEqual(users[1]);
    });

    it("should return empty array for not existed email", async () => {
      const email: string = faker.internet.email();
      const result: [User[], number] = await userService.findAllByCondition({ email });
      expect(result[1]).toEqual(0);
      return expect(result[0].length).toEqual(0);
    });

    it("should return user with verified = true with pagination", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const skip: number = 0;
      const take: number = 10;
      const result: [User[], number] = await userService.findAllByCondition({ verified: true }, skip, take);
      expect(result[0][0].verified).toEqual(true);
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(take);
    });

    it("should return user with verified = true with pagination when take = 0", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const skip: number = 0;
      const take: number = 0;
      const result: [User[], number] = await userService.findAllByCondition({ verified: true }, skip, take);
      expect(result[0][0].verified).toEqual(true);
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(users[0].length);
    });

    it("should return user with verified = true with pagination when take higher than array length", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const skip: number = 0;
      const take: number = users[1] + 10;
      const result: [User[], number] = await userService.findAllByCondition({ verified: true }, skip, take);
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(users[0].length);
    });

    it("should return user with verified = true with pagination when skip higher than array length", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const skip: number = users[1] + 10;
      const take: number = 3;
      const result: [User[], number] = await userService.findAllByCondition({ verified: true }, skip, take);
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(0);
    });
  });

  describe("findOpenQuery()", () => {
    it("should return users for given query", async () => {
      const users: [User[], number] = await userRepository.findAllByCondition({ verified: true });
      const query: FindManyOptions<User> = {
        where: {
          verified: true,
        },
      };
      const result: [User[], number] = await userService.findOpenQuery(query);
      expect(result[1]).toEqual(users[1]);
      return expect(result[0].length).toEqual(users[0].length);
    });
  });

  describe("mergeEntity()", () => {
    it("should return merged user entities", async () => {
      const email: string = faker.internet.email();
      const verified: boolean = true;
      const createdUser: User = await userService.createOne({ email });
      const partialUser: DeepPartial<User> = { verified };
      const result: User = userService.mergeEntity(createdUser, partialUser);
      createdUser.verified = verified;
      return expect(result).toEqual(createdUser);
    });
  });

  describe("updateOne()", () => {
    it("should update user with given id", async () => {
      const user: User = fixtures.get("user7");
      const email: string = "updetedUser7@email.com";
      const result: UpdateResult = await userService.updateOne(user.id, { email });
      const updatedUser: User = await userService.findOneByIdOrThrow(user.id);
      expect(result.affected).toEqual(1);
      return expect(updatedUser.email).toEqual(email);
    });
  });

  describe("createOne()", () => {
    it("should create user entity", async () => {
      const user: User = await userService.createOne();
      const email: string = faker.internet.email();
      user.email = email;
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
      return expect(user.email).toEqual(email);
    });
  });

  describe("createMany()", () => {
    it("should create user's entities", async () => {
      const email1: string = faker.internet.email();
      const user1: User = await userService.createOne({ email: email1 });
      const email2: string = faker.internet.email();
      const user2: User = await userService.createOne({ email: email2 });
      const users: User[] = [user1, user2];
      const result: User[] = await userService.createMany(users);

      expect(result.length).toEqual(users.length);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(result[0].email).toEqual(email1);
      return expect(result[1].email).toEqual(email2);
    });
  });

  describe("saveOneByEntity()", () => {
    it("should save user entity to database", async () => {
      const email: string = faker.internet.email();
      const password: string = "Qwert12345!";
      const user: User = await userRepository.createOne({ email, password });
      const result: User = await userRepository.saveOneByEntity(user);
      const res: User = await userRepository.findOneByConditionOrThrow({ email });
      expect(result.email).toEqual(email);
      return expect(result.email).toEqual(res.email);
    });
  });

  describe("saveManyByEntities()", () => {
    it("should save user entity to database", async () => {
      const email1: string = faker.internet.email();
      const password1: string = "Qwert12345!";
      const email2: string = faker.internet.email();
      const password2: string = "Qwert12345!";
      const user1: User = await userRepository.createOne({ email: email1, password: password1 });
      const user2: User = await userRepository.createOne({ email: email2, password: password2 });
      const users: User[] = [user1, user2];
      const emails: string[] = [email1, email2];
      const result: User[] = await userRepository.saveManyByEntities(users);
      const res: [User[], number] = await userRepository.findAllByCondition({ email: In(emails) } as
        | FindOptionsWhere<User>
        | FindOptionsWhere<User>[]);
      expect(result[0].email).toEqual(res[0][0].email);
      expect(result.length).toEqual(res[0].length);
      return expect(result.length).toEqual(res[1]);
    });
  });

  describe("deleteOneByEntity()", () => {
    it("should delete user by entity", async () => {
      const user: User = fixtures.get("user8");
      const result: User = await userService.deleteOneByEntity(user);
      await expect(userService.findOneByIdOrThrow(user.id)).rejects.toThrow(EntityNotFound);
      expect(result.id).toEqual(undefined);
      return expect(result.email).toEqual(user.email);
    });

    it("should not delete if user not in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.email = faker.internet.email();
      await expect(userService.findOneByIdOrThrow(user.id)).rejects.toThrow(EntityNotFound);
      const result: User = await userService.deleteOneByEntity(user);
      return expect(result.id).toEqual(undefined);
    });
  });

  describe("deleteManyByEntities()", () => {
    it("should delete users by entities", async () => {
      const user1: User = fixtures.get("user60");
      const user2: User = fixtures.get("user61");
      const users: User[] = [user1, user2];
      const ids: string[] = [user1.id, user2.id];
      const result: User[] = await userService.deleteManyByEntities(users);
      const res: [User[], number] = await userService.findAllByIds(ids);
      expect(result.length).toEqual(users.length);
      return expect(res[0].length).toEqual(0);
    });
  });

  describe("count()", () => {
    it("should count all user entities", async () => {
      const users: [User[], number] = await userService.findAll();
      const result: number = await userService.count();
      return expect(result).toEqual(users[1]);
    });

    it("should count all user entities with condition", async () => {
      const users: [User[], number] = await userService.findAllByCondition({ verified: true });
      const result: number = await userService.count({ verified: true });
      return expect(result).toEqual(users[1]);
    });
  });

  describe("clearAllTable()", () => {
    it("should clear users table", async () => {
      // can not 'TRUNCATE TABLE users' when table is parent in relation
      return await expect(userService.clearAllTable()).rejects.toThrow(QueryFailedError);
    });
  });

  //   describe("updateVerificationCode()", () => {
  //     it("should update VerificationCode for given user id", async () => {
  //       const user: User = fixtures.get("user62");
  //       const code: VerificationCode = {
  //         verificationCode: 654321
  //       }
  //       await userService.updateVerificationCode(user.id, code);
  //       const result: User = await userRepository.findOneByIdOrThrow(user.id);
  //       return expect(result.verificationCode).toEqual(code.verificationCode);
  //     });
  //   });

  //   describe("updateRole()", () => {
  //     it("should update user's role", async () => {
  //       const user: User = fixtures.get("user62");
  //       const role: Role.Admin_1 | Role.Admin_2 = Role.Admin_1;
  //       await userService.updateRole(user.id, role);
  //       const result: User = await userRepository.findOneByIdOrThrow(user.id);
  //       return expect(result.role).toEqual(role);
  //     });
  //   });

  //   describe("registerUser()", () => {
  //     it("should return exception if user already exist", async () => {
  //       const user: User = fixtures.get("user62");
  //       const userToRegister: CreateUserDto = {
  //         email: user.email,
  //         password: user.password,
  //       };
  //       return await expect(userService.registerUser(userToRegister)).rejects.toThrow(UserDuplicatedException);
  //     });

  //     it(" should create user", async () => {
  //       const userToRegister: CreateUserDto = {
  //         email: faker.internet.email(),
  //         password: "Qwert12345!",
  //       };
  //       const result: User = await userService.registerUser(userToRegister);
  //       const res: User = await userRepository.findOneByConditionOrThrow({ email: userToRegister.email });
  //       expect(result.email).toEqual(res.email);
  //       return expect(result.email).toEqual(userToRegister.email);
  //     });

  //     it("should create user by admin", async () => {
  //       const userToRegisterByAdmin: CreateUserByAdminDto = {
  //         email: faker.internet.email(),
  //         password: "Qwert12345!",
  //         role: Role.Admin_1,
  //         verified: true,
  //       };
  //       const result: User = await userService.registerUser(userToRegisterByAdmin);
  //       const res: User = await userRepository.findOneByConditionOrThrow({ email: userToRegisterByAdmin.email });
  //       expect(result.email).toEqual(res.email);
  //       expect(result.role).toEqual(res.role);
  //       expect(result.verified).toEqual(res.verified);
  //       return expect(result.email).toEqual(userToRegisterByAdmin.email);
  //     });
  //   });
});
