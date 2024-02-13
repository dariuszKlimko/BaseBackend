import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { UserRepository } from "@app/repositories/user.repository";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { BodyCRUD } from "@test/helpers/types/body";
import { postCRUD } from "@test/helpers/crud/crud";
import { deleteAuthCRUD, getAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let userRepository: UserRepository;
  let measurementRepository: MeasurementRepository;
  let profileRepository: ProfileRepository;
  let user2accessToken: string;
  let user3accessToken: string;
  let admin0_12accessToken: string;
  let user12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleFixture.get(UserRepository);
    measurementRepository = moduleFixture.get(MeasurementRepository);
    profileRepository = moduleFixture.get(ProfileRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    user2accessToken = await postCRUD(
      "/auth/login",
      { email: "user2@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    user3accessToken = await postCRUD(
      "/auth/login",
      { email: "user3@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    user12accessToken = await postCRUD(
      "/auth/login",
      { email: "user12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    admin0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
  });

  // describe("/users (POST) - register user", () => {
  //   it("should register user in database", async () => {
  //     const user: BodyCRUD = {
  //       email: "userRegister1@email.com",
  //       password: "Qwert12345!",
  //     };
  //     let userId: string;
  //     let email: string;
  //     await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.CREATED);
  //       expect(res.body.email).toEqual(user.email);
  //       userId = res.body.id;
  //       email = res.body.email;
  //     });

  //     await userRepository.findOneByConditionOrThrow({ email }).then((user) => {
  //       expect(user).toBeDefined();
  //       expect(user.email).toEqual(email);
  //     });

  //     return await profileRepository.findOneByConditionOrThrow({ userId }).then((profile) => {
  //       expect(profile.userId).toEqual(userId);
  //     });
  //   });

  //   it("should not register user if exist in database", async () => {
  //     const user: BodyCRUD = { email: "user1@email.com", password: "Qwert12345!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.CONFLICT);
  //     });
  //   });

  //   it("should not register user if email is ot email", async () => {
  //     const user: BodyCRUD = { email: "userNotRegisteremail.com", password: "Qwert12345!!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password shorter than 8 characters", async () => {
  //     const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qw1hb!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password longer than 24 characters", async () => {
  //     const user: BodyCRUD = {
  //       email: "userNotRegister@email.com",
  //       password: "Qwertoklk1234rfSdCSAWmjhb!",
  //     };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password without number", async () => {
  //     const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwertoklkmjhb!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password without special character", async () => {
  //     const user: BodyCRUD = { email: "userNotRegister@email.com", password: "Qwert12345" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password without capital letter", async () => {
  //     const user: BodyCRUD = { email: "userNotRegister@email.com", password: "qwert12345!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should not register user with password without small letter", async () => {
  //     const user: BodyCRUD = { email: "userNotRegister@email.com", password: "QWERT12345!" };
  //     return await postCRUD("/users", user, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });
  // });

  // describe("/users (GET) - get user's data", () => {
  //   it("should return user's data for valid accessToken", async () => {
  //     return await getAuthCRUD("/users", user2accessToken, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body.id).toEqual(fixtures.get("user2").id);
  //       expect(res.body.email).toEqual("user2@email.com");
  //     });
  //   });

  //   it("should not return user's data for invalid accessToken", async () => {
  //     return await getAuthCRUD("/users", "Bearer someToken", app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });

  // describe("/users (DELETE) - delete user's account", () => {
  //   it("should delete user account for given accessToken", async () => {
  //     await deleteAuthCRUD("/users", user3accessToken, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body.email).toEqual(fixtures.get("user3").email);
  //       expect(res.body.password).toEqual(fixtures.get("user3").password);
  //     });

  //     await expect(
  //       measurementRepository.findOneByConditionOrThrow({ userId: fixtures.get("user3").id })
  //     ).rejects.toThrow(EntityNotFound);

  //     await expect(
  //       profileRepository.findOneByConditionOrThrow({ userId: fixtures.get("user3").id })
  //     ).rejects.toThrow(EntityNotFound);
  //   });

  //   it("should not delete user account for given accessToken", async () => {
  //     return await deleteAuthCRUD("/users", "Bearer someToken", app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });
  // // ------------------------------------------------------------------
  // describe("/users (PATCH) - update user's account", () => {
  //   // same as auth credential update because there is no field to update/test
  // });

  // describe("/users/getall (GET) - get all users by admin", () => {
  //   it("should return first 10 and seccond 10 users for admin_0", async () => {
  //     let skip: number = 0;
  //     let take: number = 10;
  //     await getAuthCRUD(`/users/getall?skip=${skip}&take=${take}`, admin0_12accessToken, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body[0].length).toEqual(take);
  //     });
  //     skip = 10;
  //     take = 20;
  //     return await getAuthCRUD(`/users/getall?skip=${skip}&take=${take}`, admin0_12accessToken, app).then(
  //       (res) => {
  //         expect(res.status).toEqual(HttpStatus.OK);
  //         expect(res.body[0].length).toEqual(take);
  //       }
  //     );
  //   });

  //   it("should not return first 10 users for normal user accessToken", async () => {
  //     const skip: number = 0;
  //     const take: number = 10;
  //     return await getAuthCRUD(`/users/getall?skip=${skip}&take=${take}`, user12accessToken, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });

  //   it("should not return first 10 users for not jwt token", async () => {
  //     const skip: number = 0;
  //     const take: number = 10;
  //     return await getAuthCRUD(`/users/getall?skip=${skip}&take=${take}`, "someToken", app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });

  // describe("/users/getbyids (GET) - get users by ids by admin", () => {
  //   it("should return users with given id for admin_0", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const ids: string[] = users[0].map((user: User) => {
  //       return user.id;
  //     });
  //     return await getAuthCRUD("/users/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body[0].length).toEqual(ids.length);
  //       expect(res.body[0][0].id).toBe(ids[0]);
  //     });
  //   });

  //   it("should not return users with given ids for normal user accessToken", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const ids: string[] = users[0].map((user: User) => {
  //       return user.id;
  //     });
  //     return await getAuthCRUD("/users/getbyids", user12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });

  //   it("should not return users with given ids for not jwt token", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const ids: string[] = users[0].map((user: User) => {
  //       return user.id;
  //     });
  //     return await getAuthCRUD("/users/getbyids", "someToken", app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });

  //   it("should not return array for not uuid ids for admin_0", async () => {
  //     const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
  //     return await getAuthCRUD("/users/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should return an empty array for not existed uuid ids for admin_0", async () => {
  //     const ids: string[] = [
  //       "24cd5be2-ca5b-11ee-a506-0242ac120002",
  //       "2cb1f228-ca5b-11ee-a506-0242ac120002",
  //       "32c96b82-ca5b-11ee-a506-0242ac120002",
  //     ];
  //     return await getAuthCRUD("/users/getbyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body[0].length).toEqual(0);
  //     });
  //   });
  // });

  // describe("/users/getbyemails (GET) - get users by emails by admin", () => {
  //   it("should return users with given email for admin_0", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const emails: string[] = users[0].map((user: User) => {
  //       return user.email;
  //     });
  //     return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, app, { emails }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body[0].length).toEqual(emails.length);
  //       expect(res.body[0][0].email).toBe(emails[0]);
  //     });
  //   });

  //   it("should not return users with given emails for normal user accessToken", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const emails: string[] = users[0].map((user: User) => {
  //       return user.email;
  //     });
  //     return await getAuthCRUD("/users/getbyemails", user12accessToken, app, { emails }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });

  //   it("should not return users with given emails for not jwt token", async () => {
  //     const users: [User[], number] = await userRepository.findAll();
  //     const emails: string[] = users[0].map((user: User) => {
  //       return user.email;
  //     });
  //     return await getAuthCRUD("/users/getbyemails", "someToken", app, { emails }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });
  //   });

  //   it("should not return array for not emails ids for admin_0", async () => {
  //     const emails: string[] = ["wrong1email.com", "wrong2email.com", "wrong3email.com"];
  //     return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, app, { emails }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });

  //   it("should return an empty array for not existed email for admin_0", async () => {
  //     const emails: string[] = ["notExisting1@email.com", "notExisting2@email.com", "notExisting3@email.com"];
  //     return await getAuthCRUD("/users/getbyemails", admin0_12accessToken, app, { emails }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body[0].length).toEqual(0);
  //     });
  //   });
  // });

  // describe("/users/getwithrelation/:id (GET) - get users with relation by id by admin", () => {
  //   it("should return users with relation for given id for admin_0", async () => {
  //     return await getAuthCRUD(
  //       `/users/getwithrelation/${fixtures.get("user5").id}`,
  //       admin0_12accessToken,
  //       app
  //     ).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body.profile.id).toEqual(fixtures.get("profile5").id);
  //     });
  //   });

  //   it("should not return users with relation for given id for regural user", async () => {
  //     return await getAuthCRUD(`/users/getwithrelation/${fixtures.get("user5").id}`, user12accessToken, app).then(
  //       (res) => {
  //         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //       }
  //     );
  //   });

  //   it("should not return users with relation for given id for not jwt token", async () => {
  //     return await getAuthCRUD(`/users/getwithrelation/${fixtures.get("user5").id}`, "someToken", app).then(
  //       (res) => {
  //         expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //       }
  //     );
  //   });

  //   it("should not return users with relation for not exist user by admin", async () => {
  //     return await getAuthCRUD(
  //       "/users/getwithrelation/8499c166-b9ee-4ef6-a0b5-8240a8521b37",
  //       admin0_12accessToken,
  //       app
  //     ).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  //     });
  //   });

  //   it("should not return users with relation for not uuid by admin", async () => {
  //     return await getAuthCRUD("/users/getwithrelation/notuuid", admin0_12accessToken, app).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });
  // });

  // describe("/users/deletebyids (DELETE) - delete by ids by admin", () => {
  //   it("should delete users for given id for admin_0", async () => {
  //     const ids: string[] = [
  //       fixtures.get("user37").id,
  //       fixtures.get("user38").id, 
  //       fixtures.get("user39").id,  
  //     ]; 
  //     await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body.length).toEqual(ids.length);
  //     });

  //     return await userRepository.findAllByIds(ids).then((res) => {
  //       expect(res[0].length).toBe(0);
  //     });
  //   });

  //   it("should not delete users for given ids for regural user", async () => {
  //     const ids: string[] = [
  //       fixtures.get("user40").id,
  //       fixtures.get("user41").id, 
  //       fixtures.get("user42").id,  
  //     ]; 
  //     await deleteAuthCRUD("/users/deletebyids", user12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });

  //     return await userRepository.findAllByIds(ids).then((res) => {
  //       expect(res[0].length).toBe(ids.length);
  //     });
  //   });

  //   it("should not delete users for given id for not jwt token", async () => {
  //     const ids: string[] = [
  //       fixtures.get("user40").id,
  //       fixtures.get("user41").id, 
  //       fixtures.get("user42").id,  
  //     ];
  //     await deleteAuthCRUD("/users/deletebyids", "someToken", app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
  //     });

  //     return await userRepository.findAllByIds(ids).then((res) => {
  //       expect(res[0].length).toBe(ids.length);
  //     });
  //   });

  //   it("should not delete users for not exist user for not by admin", async () => {
  //     const ids: string[] = [
  //       "24cd5be2-ca5b-11ee-a506-0242ac120002",
  //       "2cb1f228-ca5b-11ee-a506-0242ac120002",
  //       "32c96b82-ca5b-11ee-a506-0242ac120002",
  //     ];
  //     return await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.OK);
  //       expect(res.body.length).toEqual(0);
  //     });
  //   });

  //   it("should not delete users for not uuid by admin", async () => {
  //     const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
  //     return await deleteAuthCRUD("/users/deletebyids", admin0_12accessToken, app, { ids }).then((res) => {
  //       expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
  //     });
  //   });
  // });

  describe("/users/createbyadmin (POST) - create user by admin", () => {});

  describe("/users/updaterole/:id (PATCH) - update user role by admin", () => {});

  afterAll(async () => {
    await app.close();
  });
});
