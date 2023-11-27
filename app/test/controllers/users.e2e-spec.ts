import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";
import { Repository } from "typeorm";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { Measurement } from "@app/entities/measurement.entity";
import { userRegister } from "@test/helpers/userRegister";
import { userLogin } from "@test/helpers/userLogin";
import { Profile } from "@app/entities/profile.entity";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let userRepository: Repository<User>;
  let measurementRepository: Repository<Measurement>;
  let profileRepository: Repository<Profile>;
  let user2accessToken: string;
  let user3accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleFixture.get("UserRepository");
    measurementRepository = moduleFixture.get("MeasurementRepository");
    profileRepository = moduleFixture.get("ProfileRepository");

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    user2accessToken = await userLogin("user2@email.com", "Qwert12345!", app).then(
      (res) => res.body.accessToken
    );
    user3accessToken = await userLogin("user3@email.com", "Qwert12345!", app).then(
      (res) => res.body.accessToken
    );
  });

  describe("/users (POST) - register user", () => {
    it("should register user in database", async () => {
      const user: CreateUserDto = { email: "userRegister1@email.com", password: "Qwert12345!" };
      let userId: string;
      await userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.email).toEqual(user.email);
        userId = res.body.id;
      });

      await userRepository.findOneBy({ email: user.email }).then((userDb) => {
        expect(userDb).toBeDefined();
        expect(userDb.email).toEqual(user.email);
      });

      return profileRepository.findOneBy({ userId }).then((profile) => {
        expect(profile.userId).toEqual(userId);
      });
    });

    it("should not register user which exist in database", () => {
      const user: CreateUserDto = { email: "user1@email.com", password: "Qwert12345!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CONFLICT);
      });
    });

    it("should not register user if email is ot email", () => {
      const user: CreateUserDto = { email: "userNotRegisteremail.com", password: "Qwert12345!!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password shorter than 8 characters", () => {
      const user: CreateUserDto = { email: "userNotRegister@email.com", password: "Qw1hb!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password longer than 24 characters", () => {
      const user: CreateUserDto = {
        email: "userNotRegister@email.com",
        password: "Qwertoklk1234rfSdCSAWmjhb!",
      };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without number", () => {
      const user: CreateUserDto = { email: "userNotRegister@email.com", password: "Qwertoklkmjhb!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without special character", () => {
      const user: CreateUserDto = { email: "userNotRegister@email.com", password: "Qwert12345" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without capital letter", () => {
      const user: CreateUserDto = { email: "userNotRegister@email.com", password: "qwert12345!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not register user with password without small letter", () => {
      const user: CreateUserDto = { email: "userNotRegister@email.com", password: "QWERT12345!" };
      return userRegister(user.email, user.password, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/users (GET) - get user's data", () => {
    it("should return user's data for valid accessToken", () => {
      return request
        .default(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${user2accessToken}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.id).toEqual(fixtures.get("user2").id);
          expect(res.body.email).toEqual("user2@email.com");
        });
    });

    it("should not return user's data for invalid accessToken", () => {
      return request
        .default(app.getHttpServer())
        .get("/users")
        .set("Authorization", "Bearer someToken")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        });
    });
  });

  describe("/users (DELETE) - delete user's account", () => {
    it("should delete user account for given accessToken", async () => {
      let userId: string;
      await request
        .default(app.getHttpServer())
        .delete("/users")
        .set("Authorization", `Bearer ${user3accessToken}`)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.id).toEqual(fixtures.get("user3").id);
          expect(res.body.email).toEqual(fixtures.get("user3").email);
          userId = res.body.id;
        });

      await measurementRepository.findOneBy({ userId }).then((user) => {
        expect(user).toEqual(null);
      });

      return profileRepository.findOneBy({ userId }).then((profile) => {
        expect(profile).toEqual(null);
      });
    });

    it("should not delete user account for given accessToken", () => {
      return request
        .default(app.getHttpServer())
        .delete("/users")
        .set("Authorization", "Bearer someToken")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        });
    });
  });
});
