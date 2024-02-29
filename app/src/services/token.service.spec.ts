import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ArrayContains, Repository } from "typeorm";
import { TokenServiceIntrface } from "@app/common/types/interfaces/services/token.service.interface";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "@app/services/token.service";
import { UserService } from "@app/services/user.service";
import { JwtPayload } from "@app/common/types/type/jwt.payload";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { GeneratorSevice } from "@app/services/generator.service";
import { ProfileRepositoryInterface } from "@app/common/types/interfaces/repositories/profile.repository.interface";
import { ProfileService } from "@app/services/profile.service";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { User } from "@app/entities/user.entity";
import { AppModule } from "@app/app.module";
import { LinkGeneratePayload } from "@app/common/types/type/linkGeneratePayload";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalid.refresh.token.exception";
import { LogoutResponse } from "@app/dtos/auth/logout.response";

describe("TokenService", () => {
  let tokenService: TokenServiceIntrface;
  let userService: UserServiceIntrface;
  // let generatorService: GeneratorServiceIntrface;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [AppModule],
      providers: [
        TokenService,
        JwtService, 
        // {
        //   provide: JwtService,
        //   useValue: {
        //     verify: jest.fn(),
        //   },
        // },
        {
          provide: UserService,
          useValue: {
            findOneByConditionOrThrow: jest.fn(),
            updateOne: jest.fn(),
            findOneByIdOrThrow: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "JWT_CONFIRMATION_TOKEN_SECRET") {
                return "ab557ed965cc0bfdbd8376cb455a120946da9";
              } else if (key === "JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME") {
                return 7200;
              } else if (key === "JWT_CONFIRMATION_TOKEN_SECRET_WRONG") {
                return "wrongsecret";
              } else if (key === "JWT_SECRET") {
                return "965cc0bfdbd8376cb455a120946da9lkds8898";
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    tokenService = module.get<TokenServiceIntrface>(TokenService);
    userService = module.get<UserServiceIntrface>(UserService);
    // generatorService = module.get<GeneratorServiceIntrface>(GeneratorSevice);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("tokenService should be defined", () => {
    expect(tokenService).toBeDefined();
  });
  it("userService should be defined", () => {
    expect(userService).toBeDefined();
  });
  it("jwtService should be defined", () => {
    expect(jwtService).toBeDefined();
  });
  it("configService should be defined", () => {
    expect(configService).toBeDefined();
  });

  describe("decodeConfirmationToken()", () => {
    it("should decode confirmationToken", async () => {
      const email: string = "test@email.com";
      const payload: LinkGeneratePayload = { email };
      const confirmationToken: string = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });
      const decodedToken: string = await tokenService.decodeConfirmationToken(confirmationToken);
      return expect(decodedToken).toEqual(email);
    });

    // it("should return Bad Request if payload is not object", async () => {
     
    // });

    it("should return Bad Request if payload not contain email property", async () => {
      const id: string = "test@email.com";
      type PayloadWithoutEmail = {
        id: string;
      };
      const payload: PayloadWithoutEmail = { id };
      const confirmationToken: string = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: `${configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
      });
      return await expect(tokenService.decodeConfirmationToken(confirmationToken)).rejects.toThrow(BadRequestException);
    });

    it("should return Bad Request if token expired", async () => {
      const email: string = "test@email.com";
      const payload: LinkGeneratePayload = { email };
      const confirmationToken: string = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
        expiresIn: "1s",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await expect(tokenService.decodeConfirmationToken(confirmationToken)).rejects.toThrow(BadRequestException);
    });

    it("should return Bad Request if token wrong signed", async () => {
      const email: string = "test@email.com";
      const payload: LinkGeneratePayload = { email };
      const confirmationToken: string = jwtService.sign(payload, {
        secret: configService.get("JWT_CONFIRMATION_TOKEN_SECRET_WRONG"),
        expiresIn: configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME"),
      });
      return await expect(tokenService.decodeConfirmationToken(confirmationToken)).rejects.toThrow(BadRequestException);
    });

    it("should return Bad Request if token is not jwt", async () => {
      const confirmationToken: string = "notJWTtoken";
      return await expect(tokenService.decodeConfirmationToken(confirmationToken)).rejects.toThrow(BadRequestException);
    });
  });

  describe("findUserByRefreshToken()", () => {
    it("should return user for given refreshToken", async () => {
      const refreshToken: string = "discnausihdca7dshc87hew87chw78cewhc78ewh";
      const user: User = new User();
      user.email = "test@email.com";
      user.refreshTokens = [refreshToken];
      jest.spyOn(userService, "findOneByConditionOrThrow").mockResolvedValueOnce(user);
      const result: User = await tokenService.findUserByRefreshToken(refreshToken);
      expect(userService.findOneByConditionOrThrow).toHaveBeenCalledWith({
        refreshTokens: ArrayContains([refreshToken]),
      });
      return expect(result.email).toEqual(user.email);
    });

    it("should not return user for not existed refreshToken", async () => {
      const refreshToken: string = "discnausihdca7dshc87hew87chw78cewhc78ewh";
      const user: User = new User();
      user.email = "test@email.com";
      jest.spyOn(userService, "findOneByConditionOrThrow").mockRejectedValueOnce(new NotFoundException());
      await expect(tokenService.findUserByRefreshToken(refreshToken)).rejects.toThrow(NotFoundException);
      return expect(userService.findOneByConditionOrThrow).toHaveBeenCalledWith({
        refreshTokens: ArrayContains([refreshToken]),
      });
    });
  });

  describe("deleteRefreshTokenFromUser()", () => {
    it("should delete refreshToken", async () => {
      const refreshToken: string = "discnausihdca7dshc87hew87chw78cewhc78ewh";
      const user: User = new User();
      user.email = "test@email.com";
      user.refreshTokens = [refreshToken];
      const result: User = await tokenService.deleteRefreshTokenFromUser(user, refreshToken);
      expect(result.refreshTokens.length).toEqual(user.refreshTokens.length);
    });

    it("should not delete refreshToken if refreshToken not exist for given user", async () => {
      const refreshToken: string = "discnausihdca7dshc87hew87chw78cewhc78ewh";
      const user: User = new User();
      user.email = "test@email.com";
      user.refreshTokens = [];
      return await expect(tokenService.deleteRefreshTokenFromUser(user, refreshToken)).rejects.toThrow(InvalidRefreshTokenException)
    });
  });

  describe("deleteAllRefreshTokensFromUser()", () => {
    it("should delete all refreshTokens for user with given id", async () => {
      const refreshToken1: string = "discnausihdca7dshc87hew87chw78cewhc78ewh";
      const refreshToken2: string = "msckdscsadkmlkdsmdsaoisladnclksadn78sas6";
      const user: User = new User();
      user.email = "test@email.com";
      jest.spyOn(userService, "findOneByIdOrThrow").mockResolvedValueOnce(user);
      user.refreshTokens = [refreshToken1, refreshToken2];
      const result: LogoutResponse = await tokenService.deleteAllRefreshTokensFromUser(user.id);
      expect(userService.findOneByIdOrThrow).toHaveBeenCalledWith(user.id);
      expect(user.refreshTokens.length).toEqual(0);
      return expect(result.email).toEqual(user.email);
    });
  });

  // describe("saveRefreshTokenToUser()", () => {
  //   it("should save refreshToken for given user", async () => {
   
  //   });
  // });

  // describe("verifyJWTtoken()", () => {
  //   it("should verify access token", async () => {
   
  //   });
  // });

});
