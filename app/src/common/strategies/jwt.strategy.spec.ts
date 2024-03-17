import { Test, TestingModule } from "@nestjs/testing";
import { User } from "@app/entities/user.entity";
import { faker } from "@faker-js/faker";
import { INestApplication, InternalServerErrorException, NotFoundException, ValidationPipe } from "@nestjs/common";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { JwtStrategy } from "@app/common/strategies/jwt.strategy";
import { PayloadJwt } from "@app/common//types/type/payloadJwt";
import { DataSource } from "typeorm";

describe("AuthService", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let jwtStrategy: JwtStrategy;
  let dataSource: DataSource;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    jwtStrategy = moduleFixture.get<JwtStrategy>(JwtStrategy);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("jwtStrategy should be defined", () => {
    expect(jwtStrategy).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("validate()", () => {
    it("should return true when user vaidated", async () => {
      const user: User = fixtures.get("user67");
      const payload: PayloadJwt = {
        sub: user.id,
      };
      const result: boolean = await jwtStrategy.validate(payload);
      return expect(result).toEqual(true);
    });

    it("should return exception when user not exist", async () => {
      const payload: PayloadJwt = {
        sub: faker.string.uuid(),
      };
      return await expect(jwtStrategy.validate(payload)).rejects.toThrow(NotFoundException);
    });

    it("should return exception when timeout", async () => {
      const user: User = fixtures.get("user67");
      const payload: PayloadJwt = {
        sub: user.id,
      };
      await dataSource.destroy();
      return await expect(jwtStrategy.validate(payload)).rejects.toThrow(InternalServerErrorException);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
