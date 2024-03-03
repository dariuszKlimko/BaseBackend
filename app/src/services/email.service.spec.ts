import { Test, TestingModule } from "@nestjs/testing";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { ConfigService } from "@nestjs/config";
import { UserService } from "@app/services/user.service";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";
import { EmailService } from "@app/services/email.service";
import { MailerService } from "@nestjs-modules/mailer";
import { User } from "@app/entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/user.not.verified.exception";
import { SentMessageInfo } from "nodemailer";
import { MailerRecipientsException } from "@app/common/exceptions/mailer.recipients.exception";

describe("EmailService", () => {
  let emailService: EmailServiceIntrface;
  let userService: UserServiceIntrface;
  let configService: ConfigService;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: UserService,
          useValue: {
            findOneByConditionOrThrow: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "EMAIL_NODEMAILER") {
                return "dareksoltys@gmail.com";
              }
              return null;
            }),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(({ to, from = configService.get("EMAIL_NODEMAILER") }) => {
              if (to.includes("@")) {
                return {
                  accepted: [`${to}`],
                  rejected: [],
                  ehlo: [
                    "SIZE 35882577",
                    "8BITMIME",
                    "AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH",
                    "ENHANCEDSTATUSCODES",
                    "PIPELINING",
                    "CHUNKING",
                    "SMTPUTF8",
                  ],
                  envelopeTime: 353,
                  messageTime: 667,
                  messageSize: 270,
                  response: "250 2.0.0 OK  1709411098 u17-20020a05600c19d100b00412a31d2e2asm9608277wmq.32 - gsmtp",
                  envelope: { from, to: [`${to}`] },
                  messageId: "<bf1e24ba-5eac-e39f-4de0-902676ab2b07@gmail.com>",
                };
              } else {
                throw new MailerRecipientsException("No recipients defined");
              }
            }),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailServiceIntrface>(EmailService);
    userService = module.get<UserServiceIntrface>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    mailerService = module.get<MailerService>(MailerService);
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

  describe("checkIfEmailExist()", () => {
    it("should return user", async () => {
      const email: string = "test@email.com";
      const user: User = new User();
      user.email = email;
      jest.spyOn(userService, "findOneByConditionOrThrow").mockResolvedValueOnce(user);
      const result: User = await emailService.checkIfEmailExist(email);
      expect(result.email).toEqual(email);
      return expect(userService.findOneByConditionOrThrow).toHaveBeenCalledWith({ email });
    });

    it("should not return user", async () => {
      const email: string = "test@email.com";
      const wrongEmail: string = "wrong@email.com";
      jest.spyOn(userService, "findOneByConditionOrThrow").mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      await expect(emailService.checkIfEmailExist(wrongEmail)).rejects.toThrow(NotFoundException);
      return expect(userService.findOneByConditionOrThrow).toHaveBeenCalledWith({ email });
    });
  });

  describe("checkIfEmailVerified()", () => {
    it("should return user if user is verified", async () => {
      const email: string = "test@email.com";
      const user: User = new User();
      user.email = email;
      user.verified = true;
      jest.spyOn(userService, "findOneByConditionOrThrow").mockResolvedValueOnce(user);
      const result: User = await emailService.checkIfEmailVerified(email);
      expect(result.verified).toEqual(true);
      return expect(userService.findOneByConditionOrThrow).toHaveBeenCalledWith({ email });
    });

    it("should not return user if user not existeing", async () => {
      const email: string = "test@email.com";
      jest.spyOn(userService, "findOneByConditionOrThrow").mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      return await expect(emailService.checkIfEmailVerified(email)).rejects.toThrow(NotFoundException);
    });

    it("should not return user if user is not verivied", async () => {
      const email: string = "test@email.com";
      const user: User = new User();
      user.email = email;
      user.verified = false;
      jest.spyOn(userService, "findOneByConditionOrThrow").mockResolvedValueOnce(user);
      return await expect(emailService.checkIfEmailVerified(email)).rejects.toThrow(UserNotVerifiedException);
    });
  });

  describe("deleteRefreshTokenFromUser()", () => {
    it("should send email", async () => {
      const email: string = "test@email.com";
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
});
