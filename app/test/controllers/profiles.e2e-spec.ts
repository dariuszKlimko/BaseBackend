import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { postCRUD } from "@test/helpers/crud/crud";
import { getAuthCRUD, patchAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import { GeneratorSevice } from "@app/services/generator.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

describe("Profiles (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let profileRepository: ProfileRepository;
  let generatorService: GeneratorSevice;
  let profile1accessToken: string;
  let profile2accessToken: string;
  let profile3accessToken: string;
  let profile47accessToken: string;
  let admin0_12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [GeneratorSevice, ConfigService, JwtService],
    }).compile();

    profileRepository = moduleFixture.get(ProfileRepository);
    generatorService = moduleFixture.get(GeneratorSevice);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    profile1accessToken = await postCRUD(
      "/auth/login",
      { email: "profile1@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    profile2accessToken = await postCRUD(
      "/auth/login",
      { email: "profile2@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    profile3accessToken = await postCRUD(
      "/auth/login",
      { email: "profile3@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    profile47accessToken = await postCRUD(
      "/auth/login",
      { email: "profile47@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    admin0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
  });

  describe("/profiles (GET) - get profile's data", () => {
    it("should get profile height for given accessToken", async () => {
      return await getAuthCRUD("/profiles", profile3accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.height).toEqual(fixtures.get("profile3").height);
      });
    });

    it("should not get profile height for not jwt accessToken", async () => {
      return await getAuthCRUD("/profiles", "someToken", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profile height for not existed user", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/profiles", accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not get profile height for wrong signed jwt", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await getAuthCRUD("/profiles", accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/profiles (PATCH) - update profile's data", () => {
    it("should update profile height in database for given accessToken if height is number", async () => {
      let userId: string;
      await patchAuthCRUD("/profiles", profile1accessToken, { height: 180 }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.height).toEqual(180);
        userId = res.body.userId;
      });

      return await profileRepository.findOneByConditionOrThrow({ userId }).then((profile) => {
        expect(profile.height).toEqual(180);
      });
    });

    it("should not update profile height in database for given not jwt accessToken if height is number", async () => {
      return await patchAuthCRUD("/profiles", "Bearer someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update profile height in database for given accessToken if height is not number", async () => {
      return await patchAuthCRUD("/profiles", profile2accessToken, { height: "180" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update profile height in database for user wrong signed jwt", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await patchAuthCRUD("/profiles", accessToken, { height: 180 }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update profile height in database for not existed user", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await patchAuthCRUD("/profiles", accessToken, { height: 180 }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/profiles/getall (GET) - get all profiles by admin", () => {
    it("should get first 10 profiles by admin", async () => {
      return await getAuthCRUD("/profiles/getall?skip=0&take=10", admin0_12accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(10);
      });
    });

    it("should not get first 10 profiles by user", async () => {
      return await getAuthCRUD("/profiles/getall?skip=0&take=10", profile47accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get first 10 profiles by wrong signed jwt", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await getAuthCRUD("/profiles/getall?skip=0&take=10", accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get first 10 profiles by not jwt token", async () => {
      return await getAuthCRUD("/profiles/getall?skip=0&take=10", "someToken", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get first 10 profiles by admin not existed in database", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/profiles/getall?skip=0&take=10", accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe("/profiles/getbyids (GET) - get profiles by admin", () => {
    it("should get profiles by ids by admin", async () => {
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body[0].length).toEqual(ids.length);
      });
    });

    it("should not get profiles by ids by user", async () => {
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyids", profile47accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by ids by wrong signed jwt", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyids", accessToken, app, { ids }).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by ids by not jwt token", async () => {
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyids", "someToken", app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by ids by not existed admin in database", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyids", accessToken, app, { ids }).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not get profiles by not existed ids by admin", async () => {
      const ids: string[] = [
        "24cd5be2-ca5b-11ee-a506-0242ac120002",
        "2cb1f228-ca5b-11ee-a506-0242ac120002",
        "32c96b82-ca5b-11ee-a506-0242ac120002",
      ];
      return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
      });
    });

    it("should not get profiles by not uuid ids by admin", async () => {
      const ids: string[] = ["wwrongId1", "wrongId2", "wrongId3"];
      return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/profiles/getbyuserids (GET) - get profiles by ids by admin", () => {
    it("should get profiles by users ids by admin", async () => {
      const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
      return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body[0].length).toEqual(ids.length);
      });
    });

    it("should not get profiles by users ids by user", async () => {
      const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
      return await getAuthCRUD("/profiles/getbyuserids", profile47accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by users ids by not jwt token", async () => {
      const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
      return await getAuthCRUD("/profiles/getbyuserids", "someToken", app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by users ids by wrong signed jwt", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyuserids", accessToken, app, { ids }).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not get profiles by users ids by admin not existed in database", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      user.role = "admin_0";
      const accessToken: string = generatorService.generateAccessToken(user);
      const ids: string[] = [
        fixtures.get("profile1").id,
        fixtures.get("profile3").id,
        fixtures.get("profile5").id,
      ];
      return await getAuthCRUD("/profiles/getbyuserids", accessToken, app, { ids }).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not get profiles by not existed users ids by admin", async () => {
      const ids: string[] = [
        "24cd5be2-ca5b-11ee-a506-0242ac120002",
        "2cb1f228-ca5b-11ee-a506-0242ac120002",
        "32c96b82-ca5b-11ee-a506-0242ac120002",
      ];
      return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
      });
    });

    it("should not get profiles by not uuid users ids by admin", async () => {
      const ids: string[] = ["wwrongId1", "wrongId2", "wrongId3"];
      return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
