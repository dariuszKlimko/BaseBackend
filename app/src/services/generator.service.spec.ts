import { Test, TestingModule } from "@nestjs/testing";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { GeneratorSevice } from "@app/services/generator.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RESET_PASSWORD_MESSAGE, VERIFICATION_EMAIL_MESSAGE } from "@app/common/constans/constans";
import { User } from "@app/entities/user.entity";
import { faker } from "@faker-js/faker";
import { JwtPayload } from "@app/common/types/type/jwt.payload";

describe("GeneratorService", () => {
  let generatorService: GeneratorServiceIntrface;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorSevice,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "JWT_CONFIRMATION_TOKEN_SECRET") {
                return "ab557ed965cc0bfdbd8376cb455a120946da9";
              } else if (key === "JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME") {
                return 7200;
              } else if (key === "CONFIRMATION_HOST_NODEMAILER") {
                return "http://localhost:80/auth/confirmation/";
              } else if (key === "JWT_SECRET") {
                return "965cc0bfdbd8376cb455a120946da9lkds8898";
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    generatorService = module.get<GeneratorServiceIntrface>(GeneratorSevice);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("generatorService should be defined", () => {
    expect(generatorService).toBeDefined();
  });

  describe("confirmationLinkGenerate()", () => {
    it("should return generated confirmation link", async () => {
      type DecodedJwt = {
        email: string;
        iat: number;
        exp: number;
      };
      const email: string = "test@email.com";
      const result: string = generatorService.confirmationLinkGenerate(email);
      expect(result).toContain("http://localhost:80/auth/confirmation/");
      const tokenFormUrl: string = result.substring(result.lastIndexOf("/") + 1);
      const decodedToken: DecodedJwt = jwtService.verify(tokenFormUrl, {
        secret: `${configService.get("JWT_CONFIRMATION_TOKEN_SECRET")}`,
      });
      return expect(decodedToken.email).toEqual(email);
    });
  });

  describe("codeGenerator()", () => {
    it("should generate number beetwen 100000 and 999999", () => {
      const result: number = generatorService.codeGenerator(100000, 999999);
      expect(result).toBeGreaterThanOrEqual(100000);
      return expect(result).toBeLessThanOrEqual(999999);
    });
  });

  describe("verificationEmailText()", () => {
    it("should return verification email text message", () => {
      const email: string = "test@email.com";
      const url: string = "http://someurl.com/";
      const result: string = generatorService.verificationEmailText(email, url);
      return expect(result).toEqual(VERIFICATION_EMAIL_MESSAGE(email, url));
    });
  });

  describe("resetPasswordEmailText()", () => {
    it("should return passord restet email text", () => {
      const email: string = "test@email.com";
      const code: number = 123456;
      const result: string = generatorService.resetPasswordEmailText(email, code);
      return expect(result).toEqual(RESET_PASSWORD_MESSAGE(email, code));
    });
  });

  describe("generateRefreshToken()", () => {
    it("should return 64 bytes random hex code", () => {
      const result: string = generatorService.generateRefreshToken();
      return expect(result.length).toEqual(128);
    });
  });

  describe("generateAccessToken()", () => {
    it("should return accessToken", () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      const decodedToken: JwtPayload = jwtService.verify(accessToken, {
        secret: configService.get("JWT_SECRET"),
      });
      return expect(decodedToken.sub).toEqual(user.id);
    });
  });
});
