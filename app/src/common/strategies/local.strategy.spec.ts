import { Test, TestingModule } from "@nestjs/testing";
import { User } from "@app/entities/user.entity";
import { INestApplication, NotFoundException, ValidationPipe } from "@nestjs/common";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { DataSource } from "typeorm";
import { LocalStrategy } from "@app/common/strategies/local.strategy";
import { UserAuthenticateException } from "../exceptions/auth/user.authenticate.exception";

describe("LocalStrategy", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let localStrategy: LocalStrategy;
  let dataSource: DataSource;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    localStrategy = moduleFixture.get<LocalStrategy>(LocalStrategy);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("localStrategy should be defined", () => {
    expect(localStrategy).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("validate()", () => {
    it("should return true when user vaidated", async () => {
      const user: User = fixtures.get("user72");
      const email: string = user.email;
      const password: string = "Qwert12345!";
      const result: User = await localStrategy.validate(email, password);
      return expect(result.email).toEqual(email);
    });

    it("should return exception when user not exist", async () => {
      const email: string = "notexistedemail@email.com";
      const password: string = 'Qwert12345!';
      return await expect(localStrategy.validate(email, password)).rejects.toThrow(NotFoundException);
    });

    it("should return exception when incorrect password", async () => {
      const user: User = fixtures.get("user72");
      const email: string = user.email;
      const password: string = "Qwert123!";
      return await expect(localStrategy.validate(email, password)).rejects.toThrow(UserAuthenticateException);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
