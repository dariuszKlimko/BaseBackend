import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { UserRepository } from "@app/repositories/user.repository";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { BodyCRUD } from "@test/helpers/types/body";
import { postCRUD } from "@test/helpers/crud/crud";
import { deleteAuthCRUD, getAuthCRUD, patchAuthCRUD, postAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import { GeneratorSevice } from "@app/services/generator.service";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { MeasurementRepositoryInterface } from "@app/common/types/interfaces/repositories/measurements.repository.interface";
import { ProfileRepositoryInterface } from "@app/common/types/interfaces/repositories/profile.repository.interface";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let userRepository: UserRepositoryIntrface;
  let measurementRepository: MeasurementRepositoryInterface;
  let profileRepository: ProfileRepositoryInterface;
  let generatorService: GeneratorServiceIntrface;
  let dataSource: DataSource;
  let user2accessToken: string;
  let user3accessToken: string;
  let user12accessToken: string;
  let user68accessToken: string;
  let user69accessToken: string;
  let user70accessToken: string;
  let admin0_12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleFixture.get<UserRepositoryIntrface>(UserRepository);
    measurementRepository = moduleFixture.get<MeasurementRepositoryInterface>(MeasurementRepository);
    profileRepository = moduleFixture.get<ProfileRepositoryInterface>(ProfileRepository);
    generatorService = moduleFixture.get<GeneratorServiceIntrface>(GeneratorSevice);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    user2accessToken = await postCRUD(
      "/auth/login",
      { email: "user2@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    user3accessToken = await postCRUD(
      "/auth/login",
      { email: "user3@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    user12accessToken = await postCRUD(
      "/auth/login",
      { email: "user12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    user68accessToken = await postCRUD(
      "/auth/login",
      { email: "user68@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    user69accessToken = await postCRUD(
      "/auth/login",
      { email: "user69@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    user70accessToken = await postCRUD(
      "/auth/login",
      { email: "user70@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);

    admin0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
  });

  it("userRepository should be defined", () => {
    expect(userRepository).toBeDefined();
  });
  it("measurementRepository should be defined", () => {
    expect(measurementRepository).toBeDefined();
  });
  it("profileRepository should be defined", () => {
    expect(profileRepository).toBeDefined();
  });
  it("generatorService should be defined", () => {
    expect(generatorService).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("/users (POST) - register user", () => {
    it("should register user in database", async () => {
      const user: BodyCRUD = {
        email: "userRegister1@email.com",
        password: "Qwert12345!",
      };
      let userId: string;
      let email: string;
      await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.email).toEqual(user.email);
        userId = res.body.id;
        email = res.body.email;
      });

      await userRepository.findOneByConditionOrThrow({ email }).then((user) => {
        expect(user).toBeDefined();
        expect(user.email).toEqual(email);
      });

      return await profileRepository.findOneByConditionOrThrow({ userId }).then((profile) => {
        expect(profile.userId).toEqual(userId);
      });
    });

    it("should not register user if user already exist in database", async () => {
      const user: BodyCRUD = { email: "user1@email.com", password: "Qwert12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CONFLICT);
      });
    });

    it("should not register user if email is not email", async () => {
      const user: BodyCRUD = { email: "userNotRegisteremail.com", password: "Qwert12345!!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is shorter than 8 characters", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qw1hb!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is longer than 24 characters", async () => {
      const user: BodyCRUD = {
        email: "userNotRegister@email.com",
        password: "Qwertoklk1234rfSdCSAWmjhb!",
      };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is without number", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwertoklkmjhb!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is without special character", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwert12345" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is without capital letter", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "qwert12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user if password is without small letter", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "QWERT12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/users (GET) - get user's data", () => {
    it("should return user's data for valid accessToken", async () => {
      return await getAuthCRUD("/users", user2accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.id).toEqual(fixtures.get("user2").id);
        expect(res.body.email).toEqual("user2@email.com");
      });
    });

    it("should not return user's data for not jwt accessToken", async () => {
      return await getAuthCRUD("/users", "someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get user with wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await getAuthCRUD("/users", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get user if user not exist in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/users", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/users (DELETE) - delete user's account", () => {
    it("should delete user account for given accessToken", async () => {
      await deleteAuthCRUD("/users", user3accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual(fixtures.get("user3").email);
        expect(res.body.password).toEqual(fixtures.get("user3").password);
      });

      await expect(
        measurementRepository.findOneByConditionOrThrow({ userId: fixtures.get("user3").id })
      ).rejects.toThrow(EntityNotFound);

      await expect(
        profileRepository.findOneByConditionOrThrow({ userId: fixtures.get("user3").id })
      ).rejects.toThrow(EntityNotFound);
    });

    it("should not delete user account for not jwt accessToken", async () => {
      return await deleteAuthCRUD("/users", "someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete user account for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await deleteAuthCRUD("/users", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete user account for user not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      return await deleteAuthCRUD("/users", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/users (PATCH) - update user's account", () => {
    it("should update user email for user with given accessToken", async () => {
      await patchAuthCRUD("/users", user68accessToken, { email: "userUpdate68@email.com" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.email).toEqual("userUpdate68@email.com");
      });

      return await userRepository
        .findOpenQuery({
          where: { email: "userUpdate68@email.com" },
        })
        .then(([users]) => {
          expect(users[0].email).toEqual("userUpdate68@email.com");
        });
    });

    it("should not update user if email is not email", async () => {
      return await patchAuthCRUD("/users", user69accessToken, { email: "userUpdate69email.com" }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
      );
    });

    it("should not update user if eternal provider exist", async () => {
      return await patchAuthCRUD("/users", user70accessToken, { email: "userUpdate69email.com" }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });
  });

  describe("/users/getall (GET) - get all users by admin", () => {
    it("should return first 10 and seccond 10 users for admin_0", async () => {
      await getAuthCRUD("/users/getall?skip=0&take=10", admin0_12accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(10);
      });
      return await getAuthCRUD("/users/getall?skip=10&take=10", admin0_12accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(10);
      });
    });

    it("should not return first 10 users for normal user accessToken", async () => {
      return await getAuthCRUD("/users/getall?skip=0&take=10", user12accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return first 10 users for admin_0 for not jwt accessToken", async () => {
      return await getAuthCRUD("/users/getall?skip=0&take=10", "someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return first 10 users for admin_0 not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/users/getall?skip=0&take=10", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/users/getbyids (GET) - get users by ids by admin", () => {
    it("should return users with given id for admin_0", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const ids: string[] = users[0].map((user: User) => {
        return user.id;
      });
      return await getAuthCRUD("/users/getbyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(ids.length);
        expect(res.body[0][0].id).toBe(ids[0]);
      });
    });

    it("should not return users with given ids for normal user accessToken", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const ids: string[] = users[0].map((user: User) => {
        return user.id;
      });
      return await getAuthCRUD("/users/getbyids", user12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return users with given ids for admin_0 with not jwt accessToken", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const ids: string[] = users[0].map((user: User) => {
        return user.id;
      });
      return await getAuthCRUD("/users/getbyids", "someToken", { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return users with given ids for admin_0 not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      const users: [User[], number] = await userRepository.findAll();
      const ids: string[] = users[0].map((user: User) => {
        return user.id;
      });
      return await getAuthCRUD("/users/getbyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return array for not uuids for admin_0", async () => {
      const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
      return await getAuthCRUD("/users/getbyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should return an empty array for not existed uuids for admin_0", async () => {
      const ids: string[] = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      return await getAuthCRUD("/users/getbyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
      });
    });
  });

  describe("/users/getbyemails (GET) - get users by emails by admin", () => {
    it("should return users with given email for admin_0", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const emails: string[] = users[0].map((user: User) => {
        return user.email;
      });
      return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(emails.length);
        expect(res.body[0][0].email).toBe(emails[0]);
      });
    });

    it("should not return users with given emails for normal user accessToken", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const emails: string[] = users[0].map((user: User) => {
        return user.email;
      });
      return await getAuthCRUD("/users/getbyemails", user12accessToken, { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return users with given emails for admin_0 with not jwt accessToken", async () => {
      const users: [User[], number] = await userRepository.findAll();
      const emails: string[] = users[0].map((user: User) => {
        return user.email;
      });
      return await getAuthCRUD("/users/getbyemails", "someToken", { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return users with given emails for admin_0 not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      const users: [User[], number] = await userRepository.findAll();
      const emails: string[] = users[0].map((user: User) => {
        return user.email;
      });
      return await getAuthCRUD("/users/getbyemails", accessToken, { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return array for not emails for admin_0", async () => {
      const emails: string[] = ["wrong1email.com", "wrong2email.com", "wrong3email.com"];
      return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should return an empty array for not existed emails for admin_0", async () => {
      const emails: string[] = ["notExisting1@email.com", "notExisting2@email.com", "notExisting3@email.com"];
      return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, { emails }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
      });
    });
  });

  describe("/users/getwithrelation/:id (GET) - get users with relation by id by admin", () => {
    it("should return user with relations for given id for admin_0", async () => {
      return await getAuthCRUD(
        `/users/getwithrelation/${fixtures.get("user5").id}`,
        admin0_12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.profile.id).toEqual(fixtures.get("profile5").id);
      });
    });

    it("should not return user with relations for given id for normal user", async () => {
      return await getAuthCRUD(
        `/users/getwithrelation/${fixtures.get("user5").id}`,
        user12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return user with relations for given id for not jwt accessToken", async () => {
      return await getAuthCRUD(`/users/getwithrelation/${fixtures.get("user5").id}`, "someToken", null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not return user with relations for given id for admin_0 not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD(`/users/getwithrelation/${fixtures.get("user5").id}`, accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });

    it("should not return user with relations for not existed user by admin_0", async () => {
      return await getAuthCRUD(
        "/users/getwithrelation/8499c166-b9ee-4ef6-a0b5-8240a8521b37",
        admin0_12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return user with relations for not uuid by admin_0", async () => {
      return await getAuthCRUD("/users/getwithrelation/notuuid", admin0_12accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/users/deletebyids (DELETE) - delete by ids by admin", () => {
    it("should delete users for given ids for admin_0", async () => {
      const ids: string[] = [fixtures.get("user37").id, fixtures.get("user38").id, fixtures.get("user39").id];
      await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(ids.length);
      });

      return await userRepository.findAllByIds(ids).then((res) => {
        expect(res[0].length).toBe(0);
      });
    });

    it("should not delete users for given ids for normal user", async () => {
      const ids: string[] = [fixtures.get("user40").id, fixtures.get("user41").id, fixtures.get("user42").id];
      await deleteAuthCRUD("/users/deletebyids", user12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });

      return await userRepository.findAllByIds(ids).then((res) => {
        expect(res[0].length).toBe(ids.length);
      });
    });

    it("should not delete users for given id for not jwt accessToken", async () => {
      const ids: string[] = [fixtures.get("user40").id, fixtures.get("user41").id, fixtures.get("user42").id];
      await deleteAuthCRUD("/users/deletebyids", "someToken", { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });

      return await userRepository.findAllByIds(ids).then((res) => {
        expect(res[0].length).toBe(ids.length);
      });
    });

    it("should not delete users for given id for admin_0 not existed in database", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      const ids: string[] = [fixtures.get("user40").id, fixtures.get("user41").id, fixtures.get("user42").id];
      await deleteAuthCRUD("/users/deletebyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });

      return await userRepository.findAllByIds(ids).then((res) => {
        expect(res[0].length).toBe(ids.length);
      });
    });

    it("should not delete users wchih not exist in database by admin_0", async () => {
      const ids: string[] = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      return await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(0);
      });
    });

    it("should not delete users for not uuid by admin_0", async () => {
      const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
      return await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/users/createbyadmin (POST) - create user by admin", () => {
    it("should create user by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin1@emailArrayDto.com",
        password: "Qwert12345!",
        role: "admin_1",
        verified: true,
      };
      let userId: string;
      await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.email).toEqual(user.email);
        expect(res.body.id).toBeDefined();
        userId = res.body.id;
      });

      return await userRepository.findOneByIdOrThrow(userId).then((res) => {
        expect(res.id).toEqual(userId);
        expect(res.email).toEqual(user.email);
      });
    });

    it("should not create user by normal user", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin2@emailArrayDto.com",
        password: "Qwert12345!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", user12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not create user by admin_0 with not jwt accessToken", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "Qwert12345!",
        role: "admin_1",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", "someToken", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not create user by admin_0 not existed in database", async () => {
      const admin: User = new User();
      admin.id = faker.string.uuid();
      admin.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(admin);
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "Qwert12345!",
        role: "admin_1",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not create user for wrong email by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3emailArrayDto.com",
        password: "Qwert12345!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password shorter than 8 characters by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "Qwert1!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password longer than 24 characters by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "Qwert1234567890qwertyuio!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password without number by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "QwertOHJhbs!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password without special character by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "Qwert1234567",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password without capital letter by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "qwert12345!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user for password without small letter by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userCreatedByAdmin3@emailArrayDto.com",
        password: "QWERTY12345!",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create user if already exist in database by admin_0", async () => {
      const user: BodyCRUD = {
        email: "userToCreateByAdmin22@email.com",
        password: "Qwert12345!",
        role: "admin_1",
        verified: true,
      };
      return await postAuthCRUD("/users/createbyadmin", admin0_12accessToken, user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CONFLICT);
      });
    });
  });

  describe("/users/updaterole/:id (PATCH) - update user role by admin", () => {
    it("should update user role with given id to admin_1 by admin_0", async () => {
      const body: BodyCRUD = {
        role: "admin_1",
      };
      await patchAuthCRUD(`/users/updaterole/${fixtures.get("user43").id}`, admin0_12accessToken, body, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.role).toEqual(body.role);
        }
      );

      return await userRepository.findOneByIdOrThrow(fixtures.get("user43").id).then((res) => {
        expect(res.role).toBe(body.role);
      });
    });

    it("should not update user role with given id to admin_1 by normal user", async () => {
      const body: BodyCRUD = {
        role: "admin_1",
      };
      return await patchAuthCRUD(
        `/users/updaterole/${fixtures.get("user44").id}`,
        user12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update user role with given id to admin_1 by adimn_0 with not jwt accessToken", async () => {
      const body: BodyCRUD = {
        role: "admin_1",
      };
      return await patchAuthCRUD(`/users/updaterole/${fixtures.get("user44").id}`, "someToken", body, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not update user role with given id to admin_1 by admin_0 not existed in database", async () => {
      const admin: User = new User();
      admin.id = faker.string.uuid();
      admin.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(admin);
      const body: BodyCRUD = {
        role: "admin_1",
      };
      return await patchAuthCRUD(`/users/updaterole/${fixtures.get("user44").id}`, accessToken, body, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });

    it("should not update user role for not existed id to admin_1 by admin_0", async () => {
      const body: BodyCRUD = {
        role: "admin_1",
      };
      return await patchAuthCRUD(
        "/users/updaterole/017cd98b-2b8a-4293-9a1e-768be112b60e",
        admin0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not update user role for not uuid to admin_1 by admin_0", async () => {
      const body: BodyCRUD = {
        role: "admin_1",
      };
      return await patchAuthCRUD("/users/updaterole/wrongUuid", admin0_12accessToken, body, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update user role to wrong role adm_1 by admin_0", async () => {
      const body: BodyCRUD = {
        role: "adm_1",
      };
      return await patchAuthCRUD(
        `/users/updaterole/${fixtures.get("user45").id}`,
        admin0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
