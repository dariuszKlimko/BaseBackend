import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { UserRepository } from "@app/repositories/user.repository";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { BodyCRUD } from "@test/helpers/types/body";
import { postCRUD } from "@test/helpers/crud/crud";
import { deleteAuthCRUD, getAuthCRUD } from "@test/helpers/crud/auth.crud";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let userRepository: UserRepository;
  let measurementRepository: MeasurementRepository;
  let profileRepository: ProfileRepository;
  let user2accessToken: string;
  let user3accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleFixture.get(UserRepository);
    measurementRepository = moduleFixture.get(MeasurementRepository);
    profileRepository = moduleFixture.get(ProfileRepository);

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

    it("should not register user if exist in database", async () => {
      const user: BodyCRUD = { email: "user1@email.com", password: "Qwert12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CONFLICT);
      });
    });

    it("should not register user if email is ot email", async () => {
      const user: BodyCRUD = { email: "userNotRegisteremail.com", password: "Qwert12345!!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password shorter than 8 characters", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qw1hb!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password longer than 24 characters", async () => {
      const user: BodyCRUD = {
        email: "userNotRegister@email.com",
        password: "Qwertoklk1234rfSdCSAWmjhb!",
      };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without number", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwertoklkmjhb!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without special character", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwert12345" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without capital letter", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "qwert12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without small letter", async () => {
      const user: BodyCRUD = { email: "userNotRegister@email.com", password: "QWERT12345!" };
      return await postCRUD("/users", user, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/users (GET) - get user's data", () => {
    it("should return user's data for valid accessToken", async () => {
      return await getAuthCRUD("/users", user2accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.id).toEqual(fixtures.get("user2").id);
        expect(res.body.email).toEqual("user2@email.com");
      });
    });

    it("should not return user's data for invalid accessToken", async () => {
      return await getAuthCRUD("/users", "Bearer someToken", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/users (DELETE) - delete user's account", () => {
    it("should delete user account for given accessToken", async () => {
      await deleteAuthCRUD("/users", user3accessToken, app).then((res) => {
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

    it("should not delete user account for given accessToken", async () => {
      return await deleteAuthCRUD("/users", "Bearer someToken", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
