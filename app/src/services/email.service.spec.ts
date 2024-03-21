import { Test, TestingModule } from "@nestjs/testing";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { ConfigService } from "@nestjs/config";
import { UserService } from "@app/services/user.service";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";
import { EmailService } from "@app/services/email.service";
import { MailerService } from "@nestjs-modules/mailer";
import { User } from "@app/entities/user.entity";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/user.not.verified.exception";
import { SentMessageInfo } from "nodemailer";
import { MailerRecipientsException } from "@app/common/exceptions/mailer.recipients.exception";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { AppModule } from "@app/app.module";
import cookieParser from "cookie-parser";
import { faker } from "@faker-js/faker";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { DataSource } from "typeorm";

describe("EmailService", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let emailService: EmailServiceIntrface;
  let userService: UserServiceIntrface;
  let configService: ConfigService;
  let mailerService: MailerService;
  let dataSource: DataSource;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    emailService = moduleFixture.get<EmailServiceIntrface>(EmailService);
    userService = moduleFixture.get<UserServiceIntrface>(UserService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    mailerService = moduleFixture.get<MailerService>(MailerService);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  it("emailService should be defined", () => {
    expect(emailService).toBeDefined();
  });
  it("userService should be defined", () => {
    expect(userService).toBeDefined();
  });

  it("configService should be defined", () => {
    expect(configService).toBeDefined();
  });
  it("mailerService should be defined", () => {
    expect(mailerService).toBeDefined();
  });
  it("dataSource should be defined", () => {
    expect(dataSource).toBeDefined();
  });

  describe("checkIfEmailExist()", () => {
    it("should return user", async () => {
      const user: User = fixtures.get("user1");
      const result: User = await emailService.checkIfEmailExist(user.email);
      return expect(result.email).toEqual(user.email);
    });

    it("should not return user", async () => {
      const email: string = faker.internet.email();
      return await expect(emailService.checkIfEmailExist(email)).rejects.toThrow(EntityNotFound);
    });
  });

  describe("checkIfEmailVerified()", () => {
    it("should return user if user is verified", async () => {
      const user: User = fixtures.get("user1");
      const result: User = await emailService.checkIfEmailVerified(user.email);
      return expect(result.verified).toEqual(true);
    });

    it("should not return user if user not existeing", async () => {
      const email: string = faker.internet.email();
      return await expect(emailService.checkIfEmailVerified(email)).rejects.toThrow(EntityNotFound);
    });

    it("should not return user if user is not verivied", async () => {
      const user: User = fixtures.get("user10");
      return await expect(emailService.checkIfEmailVerified(user.email)).rejects.toThrow(UserNotVerifiedException);
    });
  });

  describe("sendEmail()", () => {
    it("should send email", async () => {
      const email: string = faker.internet.email();
      const result: SentMessageInfo = await emailService.sendEmail(email, "text", "subject");
      expect(result.accepted.length).toBe(1);
      expect(result.accepted[0]).toEqual(email);
      expect(result.envelope.to[0]).toEqual(email);
      return expect(result.envelope.from).toEqual(configService.get("EMAIL_NODEMAILER"));
    });

    it("should not send email", async () => {
      const email: string = "testemail.com";
      return await expect(emailService.sendEmail(email, "text", "subject")).rejects.toThrow(
        MailerRecipientsException
      );
    });
  });

  describe("checkIfEmail()", () => {
    it("should return email if addres is correct", () => {
      const email: string = "example@email.com";
      const result: string = emailService.checkIfEmail(email);
      return expect(result).toEqual(email);
    });

    it("should not return email if addres is incorrect", () => {
      const email: string = "exampleemail.com";
      return expect(() => emailService.checkIfEmail(email)).toThrow(BadRequestException);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
