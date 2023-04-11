// import { Test, TestingModule } from "@nestjs/testing";
// import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
// import * as request from "supertest";
// import { AppModule } from "@app/app.module";
// import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";
// import { Repository } from "typeorm";
// import { User } from "@app/entities/user.entity";
// import { CreateUserDto } from "@app/dtos/user/create-user.dto";
// import { Measurement } from "@app/entities/measurement.entity";
// import { userRegister } from "@test/helpers/userRegister";
// import { userLogin } from "@test/helpers/userLogin";
// import { Profile } from "@app/entities/profile.entity";

// describe("Profiles (e2e)", () => {
//   let app: INestApplication;
//   let fixtures: FixtureFactory;
//   let userRepository: Repository<User>;
//   let measurementRepository: Repository<Measurement>;
//   let profileRepository: Repository<Profile>;
//   let user2accessToken: string;
//   let user3accessToken: string;
//   let user4accessToken: string;

//   beforeAll(async () => {
//     fixtures = await loadFixtures();
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     userRepository = moduleFixture.get("UserRepository");
//     measurementRepository = moduleFixture.get("MeasurementRepository");
//     profileRepository = moduleFixture.get("ProfileRepository");

//     app = moduleFixture.createNestApplication();
//     app.useGlobalPipes(new ValidationPipe());
//     await app.init();

//     user2accessToken = await userLogin("user2@email.com", "Qwert12345!", app).then((res) => res.body.accessToken);
//     user3accessToken = await userLogin("user3@email.com", "Qwert12345!", app).then((res) => res.body.accessToken);
//     user4accessToken = await userLogin("user4@email.com", "Qwert12345!", app).then((res) => res.body.accessToken);
//   });

//   describe("/users (PATCH) - update user's data", () => {
//     it("should update user height in database for given accessToken if height is number", async () => {
//       await request
//         .default(app.getHttpServer())
//         .patch("/users")
//         .set("Authorization", `Bearer ${user4accessToken}`)
//         .send({ height: 180 })
//         .then((res) => {
//           expect(res.status).toEqual(HttpStatus.OK);
//           expect(res.body.height).toEqual(180);
//         });

//       return userRepository.findOneBy({ email: "user4@email.com" }).then((user) => {
//         expect(user.height).toEqual(180);
//       });
//     });

//     it("should not update user height in database for given accessToken if height is number", () => {
//       return request
//         .default(app.getHttpServer())
//         .patch("/users")
//         .set("Authorization", "Bearer someToken")
//         .then((res) => {
//           expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
//         });
//     });

//     it("should not update user height in database for given accessToken if height is not number", () => {
//       return request
//         .default(app.getHttpServer())
//         .patch("/users")
//         .set("Authorization", `Bearer ${user4accessToken}`)
//         .send({ height: "180" })
//         .then((res) => {
//           expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
//         });
//     });
//   });
// });
