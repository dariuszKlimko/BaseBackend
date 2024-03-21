import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, NotFoundException, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { DataSource } from "typeorm";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";

describe("AuthService", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtAuthGuard: JwtAuthGuard;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtAuthGuard = moduleFixture.get<JwtAuthGuard>(JwtAuthGuard);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("jwtAuthGuard should be defined", () => {
    expect(jwtAuthGuard).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("handleRequest()", () => {
    it("should return true when user vaidated", () => {
      return expect(jwtAuthGuard.handleRequest(null, true, null)).toEqual(true);
    });

    it("should return exception when user not exist", () => {
      return expect(() => jwtAuthGuard.handleRequest(null, false, null)).toThrow(NotFoundException);
    });

    it("should return exception when JsonWebTokenError", () => {
      const info: Error = {
        name: "JsonWebTokenError",
        message: "",
      };
      return expect(() => jwtAuthGuard.handleRequest(null, null, info)).toThrow(UnauthorizedException);
    });

    it("should return exception when TokenExpiredError", () => {
      const info: Error = {
        name: "TokenExpiredError",
        message: "",
      };
      return expect(() => jwtAuthGuard.handleRequest(null, null, info)).toThrow(UnauthorizedException);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
