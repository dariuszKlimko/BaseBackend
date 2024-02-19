import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { getCRUD, postCRUD } from "@test/helpers/crud/crud";
import { getAuthCRUD, patchAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import { GeneratorSevice } from "@app/services/generator.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { MathServiceIntrface } from "@app/services/interfaces/math.service.interface";
import { MathSevice } from "@app/services/math.service";
import exp from "constants";

describe("MeasurementAdmin (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
//   let profileRepository: ProfileRepository;
  let generatorService: GeneratorSevice;
//   let mathService: MathServiceIntrface;
  let measurement48accessToken: string;
  let measurement49accessToken: string;
  let measurement50accessToken: string;
  let measurement51accessToken: string;
  let admin_0_12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    //   providers: [ConfigService, JwtService],
    }).compile();

    // profileRepository = moduleFixture.get(ProfileRepository);
    generatorService = moduleFixture.get(GeneratorSevice);
    // mathService = moduleFixture.get(MathSevice);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    measurement48accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement48@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    measurement49accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement49@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    measurement50accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement50@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    measurement51accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement51@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    admin_0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
  });


  describe("/measurements/getall (GET) - get all measurements by admin", () => {
    it("should return first 10 measuremants for admin_0", async ()=> {
        return await getAuthCRUD("/measurements/getall?skip=0&take=10", admin_0_12accessToken, app).then((res) => {
            expect(res.status).toEqual(HttpStatus.OK);
            expect(res.body[0].length).toEqual(10);
        });
    });

    it("should not return first 10 measuremants for normal user", async ()=> {
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", measurement48accessToken, app).then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return first 10 measuremants for not jwt accessToken by admin_o", async ()=> {
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", "someToken", app).then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return first 10 measuremants for not existed user", async () => {
      const user: User = new User();
      user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", accessToken, app).then((res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return first 10 measuremants for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", accessToken, app).then((res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/measurements/getbyids (GET) - get measurements by id by admin", () => {

  });

  describe("/measurements/deletebyids (DELETE) - delete measurements by id by admin", () => {

  });

  describe("/measurements/daletebyuserid/:userid (DELETE) - delete measurements by id by admin", () => {

  });

  describe("/measurements/updatebyid/:id (UPDATE) - update measurements by id by admin", () => {

  });

//   describe("/profiles (GET) - get profile's data", () => {
//     it("should get profile height for given accessToken", async () => {
//       return await getAuthCRUD("/profiles", measurement3accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.OK);
//         expect(res.body.height).toEqual(fixtures.get("profile3").height);
//       });
//     });

//     it("should not get profile height for not jwt accessToken", async () => {
//       return await getAuthCRUD("/profiles", "someToken", app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profile height for not existed user", async () => {
//       const user: User = new User();
//       user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
//       const accessToken: string = generatorService.generateAccessToken(user);
//       return await getAuthCRUD("/profiles", accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.NOT_FOUND);
//       });
//     });

//     it("should not get profile height for wrong signed jwt accessToken", async () => {
//       const accessToken: string =
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
//       return await getAuthCRUD("/profiles", accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });
//   });

//   describe("/profiles (PATCH) - update profile's data", () => {
//     it("should update profile height in database for given accessToken if height is number", async () => {
//       let userId: string;
//       await patchAuthCRUD("/profiles", profile1accessToken, { height: 180 }, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.OK);
//         expect(res.body.height).toEqual(180);
//         userId = res.body.userId;
//       });

//       return await profileRepository.findOneByConditionOrThrow({ userId }).then((profile) => {
//         expect(profile.height).toEqual(180);
//       });
//     });

//     it("should not update profile height in database for given not jwt accessToken if height is number", async () => {
//       return await patchAuthCRUD("/profiles", "someToken", null, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not update profile height in database for given accessToken if height is not number", async () => {
//       return await patchAuthCRUD("/profiles", profile2accessToken, { height: "180" }, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
//       });
//     });

//     it("should not update profile height in database for user wrong signed jwt accessToken", async () => {
//       const accessToken: string =
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
//       return await patchAuthCRUD("/profiles", accessToken, { height: 180 }, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not update profile height in database for not existed user", async () => {
//       const user: User = new User();
//       user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
//       const accessToken: string = generatorService.generateAccessToken(user);
//       return await patchAuthCRUD("/profiles", accessToken, { height: 180 }, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.NOT_FOUND);
//       });
//     });
//   });

//   describe("/profiles/getall (GET) - get all profiles by admin", () => {
//     it("should get first 10 profiles by admin_0", async () => {
//       return await getAuthCRUD("/profiles/getall?skip=0&take=10", admin0_12accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.OK);
//         expect(res.body[0].length).toEqual(10);
//       });
//     });

//     it("should not get first 10 profiles by user", async () => {
//       return await getAuthCRUD("/profiles/getall?skip=0&take=10", profile47accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get first 10 profiles by wrong signed jwt accessToken by admin_0", async () => {
//       const accessToken: string =
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
//       return await getAuthCRUD("/profiles/getall?skip=0&take=10", accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get first 10 profiles by admin_0 with not jwt accessToken", async () => {
//       return await getAuthCRUD("/profiles/getall?skip=0&take=10", "someToken", app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get first 10 profiles by admin_0 not existed in database", async () => {
//       const user: User = new User();
//       user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
//       user.role = "admin_0";
//       const accessToken: string = generatorService.generateAccessToken(user);
//       return await getAuthCRUD("/profiles/getall?skip=0&take=10", accessToken, app).then((res) => {
//         expect(res.status).toEqual(HttpStatus.NOT_FOUND);
//       });
//     });
//   });

//   describe("/profiles/getbyids (GET) - get profiles by admin", () => {
//     it("should get profiles by ids by admin_0", async () => {
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.OK);
//         expect(res.body[0].length).toEqual(ids.length);
//       });
//     });

//     it("should not get profiles by ids by normal user user", async () => {
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyids", profile47accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by ids by admin_0 with wrong signed jwt accessToken", async () => {
//       const accessToken: string =
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyids", accessToken, app, { ids }).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by ids by admin_0 with not jwt accessToken", async () => {
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyids", "someToken", app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by ids by not existed admin_0 in database", async () => {
//       const user: User = new User();
//       user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
//       user.role = "admin_0";
//       const accessToken: string = generatorService.generateAccessToken(user);
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyids", accessToken, app, { ids }).then((res) => {
//         expect(res.status).toEqual(HttpStatus.NOT_FOUND);
//       });
//     });

//     it("should not get profiles by not existed ids by admin_0", async () => {
//       const ids: string[] = [
//         "24cd5be2-ca5b-11ee-a506-0242ac120002",
//         "2cb1f228-ca5b-11ee-a506-0242ac120002",
//         "32c96b82-ca5b-11ee-a506-0242ac120002",
//       ];
//       return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.OK);
//         expect(res.body[0].length).toEqual(0);
//       });
//     });

//     it("should not get profiles by not uuid ids by admin_0", async () => {
//       const ids: string[] = ["wwrongId1", "wrongId2", "wrongId3"];
//       return await getAuthCRUD("/profiles/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.BAD_REQUEST);
//       });
//     });
//   });

//   describe("/profiles/getbyuserids (GET) - get profiles by ids by admin", () => {
//     it("should get profiles by users ids by admin_0", async () => {
//       const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
//       return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.OK);
//         expect(res.body[0].length).toEqual(ids.length);
//       });
//     });

//     it("should not get profiles by users ids by normal user", async () => {
//       const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
//       return await getAuthCRUD("/profiles/getbyuserids", profile47accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by users ids by admin_0 with not jwt accessToken", async () => {
//       const ids: string[] = [fixtures.get("user31").id, fixtures.get("user33").id, fixtures.get("user5").id];
//       return await getAuthCRUD("/profiles/getbyuserids", "someToken", app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by users ids by admin_0 with wrong signed jwt accessToken", async () => {
//       const accessToken: string =
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyuserids", accessToken, app, { ids }).then((res) => {
//         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//       });
//     });

//     it("should not get profiles by users ids by admin_0 not existed in database", async () => {
//       const user: User = new User();
//       user.id = "24cd5be2-ca5b-11ee-a506-0242ac120002";
//       user.role = "admin_0";
//       const accessToken: string = generatorService.generateAccessToken(user);
//       const ids: string[] = [
//         fixtures.get("profile1").id,
//         fixtures.get("profile3").id,
//         fixtures.get("profile5").id,
//       ];
//       return await getAuthCRUD("/profiles/getbyuserids", accessToken, app, { ids }).then((res) => {
//         expect(res.status).toEqual(HttpStatus.NOT_FOUND);
//       });
//     });

//     it("should not get profiles by not existed users ids by admin_0", async () => {
//       const ids: string[] = [
//         "24cd5be2-ca5b-11ee-a506-0242ac120002",
//         "2cb1f228-ca5b-11ee-a506-0242ac120002",
//         "32c96b82-ca5b-11ee-a506-0242ac120002",
//       ];
//       return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.OK);
//         expect(res.body[0].length).toEqual(0);
//       });
//     });

//     it("should not get profiles by not uuid users ids by admin_0", async () => {
//       const ids: string[] = ["wwrongId1", "wrongId2", "wrongId3"];
//       return await getAuthCRUD("/profiles/getbyuserids", admin0_12accessToken, app, { ids }).then((res) => {
//         expect(res.status).toBe(HttpStatus.BAD_REQUEST);
//       });
//     });
//   });

  afterAll(async () => {
    await app.close();
  });
});
