import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/loadFixtures";
import { Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let userRepository: Repository<User>

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleFixture.get("UserRepository");

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe("/users (POST) - register user", () => {
    it("should register user in database", async() => {
      const user: CreateUserDto = { email: "test1@email.com", password: "Qwert12345!"};
      await request.default(app.getHttpServer())
      .post("/users")
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.email).toEqual(user.email);
      })
      return userRepository.findOneBy({email: user.email}).then((userDb) => {
        console.log(userDb);
        expect(userDb).toBeDefined();
        expect(userDb.email).toEqual(user.email);
      })
    });

  });

  describe("/users (GET) - get user's data", () => {
    it("should get user from database", () => {});
  });

  describe("/users (PATCH) - update user's data", () => {
    it("should update user in database", () => {});
  });

  describe("/users (DELETE) - delete user's account", () => {
    it("should delete user account", () => {});
  });
});
