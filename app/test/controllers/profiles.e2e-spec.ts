import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { postCRUD } from "@test/crud/crud";
import { getAuthCRUD, patchAuthCRUD } from "@test/crud/auth.crud";

describe("Profiles (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let profileRepository: ProfileRepository;
  let profile1accessToken: string;
  let profile2accessToken: string;
  let profile3accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    profileRepository = moduleFixture.get(ProfileRepository);

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

    it("should not update profile height in database for given accessToken if height is number", async () => {
      return await patchAuthCRUD("/profiles", "Bearer someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update profile height in database for given accessToken if height is not number", async () => {
      return await patchAuthCRUD("/profiles", profile2accessToken, { height: "180" }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/profiles (GET) - get profile's data", () => {
    it("should get profile height for given accessToken", async () => {
      return await getAuthCRUD("/profiles", profile3accessToken, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.height).toEqual(fixtures.get("profile3").height);
      });
    });

    it("should not get profile height for invalid accessToken", async () => {
      return await getAuthCRUD("/profiles", "someToken", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
