import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactoryInterface } from "@test/helpers/load.fixtures";
import { postCRUD } from "@test/helpers/crud/crud";
import { deleteAuthCRUD, getAuthCRUD, patchAuthCRUD } from "@test/helpers/crud/auth.crud";
import { User } from "@app/entities/user.entity";
import { GeneratorSevice } from "@app/services/generator.service";
import { BodyCRUD } from "@test/helpers/types/body";
import { MeasurementRepositoryInterface } from "@app/common/types/interfaces/repositories/measurements.repository.interface";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { In } from "typeorm";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { faker } from "@faker-js/faker";

describe("MeasurementAdmin (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactoryInterface;
  let generatorService: GeneratorServiceIntrface;
  let measurementRepository: MeasurementRepositoryInterface;
  let measurement48accessToken: string;
  let measurement50accessToken: string;
  let admin_0_12accessToken: string;

  beforeAll(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    generatorService = moduleFixture.get<GeneratorServiceIntrface>(GeneratorSevice);
    measurementRepository = moduleFixture.get<MeasurementRepositoryInterface>(MeasurementRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    measurement48accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement48@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    measurement50accessToken = await postCRUD(
      "/auth/login",
      { email: "measurement50@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
    admin_0_12accessToken = await postCRUD(
      "/auth/login",
      { email: "admin_0_12@email.com", password: "Qwert12345!" },
      app
    ).then((res) => res.body.accessToken);
  });

  describe("/measurements/getall (GET) - get all measurements by admin", () => {
    it("should return first 10 measuremants for admin_0", async () => {
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", admin_0_12accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body[0].length).toEqual(10);
        }
      );
    });

    it("should not return first 10 measuremants for normal user", async () => {
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", measurement48accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not return first 10 measuremants for not jwt accessToken by admin_o", async () => {
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", "someToken", null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return first 10 measuremants for not existed user", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return first 10 measuremants for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await getAuthCRUD("/measurements/getall?skip=0&take=10", accessToken, null, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("/measurements/getbyids (GET) - get measurements by id by admin", () => {
    it("should return measurements with given ids for admin_0", async () => {
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await getAuthCRUD("/measurements/getbyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(ids.length);
      });
    });

    it("should not return measurements with given ids for normal user", async () => {
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await getAuthCRUD("/measurements/getbyids", measurement48accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return measurements with given ids for not jwt accessToken by admin_o", async () => {
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await getAuthCRUD("/measurements/getbyids", "someToken", { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return measurements with given ids for not existed user", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await getAuthCRUD("/measurements/getbyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not return measurements with given ids for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await getAuthCRUD("/measurements/getbyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not return measurements with given ids for not existed measurements for admin_0", async () => {
      const ids: string[] = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      return await getAuthCRUD("/measurements/getbyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
        expect(res.body[0]).toEqual([]);
      });
    });

    it("should not return measurements with given ids for measurements with not uuid for admin_0", async () => {
      const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
      return await getAuthCRUD("/measurements/getbyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/measurements/daletebyids (DELETE) - delete measurements by id by admin", () => {
    it("should delete measurements with given ids for admin_0", async () => {
      const ids: string[] = [
        fixtures.get("measurement11").id,
        fixtures.get("measurement12").id,
        fixtures.get("measurement13").id,
      ];
      await deleteAuthCRUD("/measurements/deletebyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(ids.length);
      });

      return await measurementRepository.findAllByCondition({ id: In(ids) }).then((res) => {
        expect(res[0].length).toEqual(0);
      });
    });

    it("should not delete measurements with given ids for normal user", async () => {
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await deleteAuthCRUD("/measurements/deletebyids", measurement48accessToken, { ids }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
      );
    });

    it("should not delete measurements with given ids for not jwt accessToken by admin_o", async () => {
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await deleteAuthCRUD("/measurements/deletebyids", "someToken", { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete measurements with given ids for not existed user", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await deleteAuthCRUD("/measurements/deletebyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not delete measurements with given ids for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const ids: string[] = [
        fixtures.get("measurement1").id,
        fixtures.get("measurement2").id,
        fixtures.get("measurement3").id,
      ];
      return await deleteAuthCRUD("/measurements/deletebyids", accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete measurements with given ids for not existed measurements for admin_0", async () => {
      const ids: string[] = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      return await deleteAuthCRUD("/measurements/deletebyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(0);
        expect(res.body).toEqual([]);
      });
    });

    it("should not delete measurements with given ids for measurements with not uuid for admin_0", async () => {
      const ids: string[] = ["wrongId1", "wrongId2", "wrongId3"];
      return await deleteAuthCRUD("/measurements/deletebyids", admin_0_12accessToken, { ids }, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/measurements/daletebyuserid/:userid (DELETE) - delete measurements by id by admin", () => {
    it("should delete measurements for userId for admin_0", async () => {
      await deleteAuthCRUD(
        `/measurements/deletebyuserid/${fixtures.get("user49").id}`,
        admin_0_12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
      });

      return await measurementRepository.findAllByCondition({ userId: fixtures.get("user49").id }).then((res) => {
        expect(res[0].length).toEqual(0);
      });
    });

    it("should not delete measurements for userId for normal user", async () => {
      return await deleteAuthCRUD(
        `/measurements/deletebyuserid/${fixtures.get("user50").id}`,
        measurement50accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete measurements for userId for not jwt accessToken by admin_o", async () => {
      return await deleteAuthCRUD(
        `/measurements/deletebyuserid/${fixtures.get("user50").id}`,
        "someToken",
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete measurements for userId for not existed user accessToken", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      return await deleteAuthCRUD(
        `/measurements/deletebyuserid/${fixtures.get("user50").id}`,
        accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not delete measurements for userId for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      return await deleteAuthCRUD(
        `/measurements/deletebyuserid/${fixtures.get("user50").id}`,
        accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not delete measurements for userId for not existed measurements for admin_0", async () => {
      return await deleteAuthCRUD(
        `/measurements/deletebyuserid/${faker.string.uuid()}`,
        admin_0_12accessToken,
        null,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(0);
        expect(res.body).toEqual([]);
      });
    });

    it("should not delete measurements with given ids for measurements with not uuid for admin_0", async () => {
      return await deleteAuthCRUD("/measurements/deletebyuserid/wrongId1", admin_0_12accessToken, null, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
      );
    });
  });

  describe("/measurements/updatebyid/:id (UPDATE) - update measurements by id by admin", () => {
    it("should update weight of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        weight: 100,
      };
      await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.weight).toEqual(body.weight);
      });

      return await measurementRepository.findOneByIdOrThrow(fixtures.get("measurement20").id).then((res) => {
        expect(res.weight).toEqual(body.weight);
      });
    });

    it("should update calloriesDelivered of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        caloriesDelivered: 2100,
      };
      await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.caloriesDelivered).toEqual(body.caloriesDelivered);
      });

      return await measurementRepository.findOneByIdOrThrow(fixtures.get("measurement20").id).then((res) => {
        expect(res.caloriesDelivered).toEqual(body.caloriesDelivered);
      });
    });

    it("should update distanceTraveled of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        distanceTraveled: 21,
      };
      await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.distanceTraveled).toEqual(body.distanceTraveled);
      });

      return await measurementRepository.findOneByIdOrThrow(fixtures.get("measurement20").id).then((res) => {
        expect(res.distanceTraveled).toEqual(body.distanceTraveled);
      });
    });

    it("should update measurementDate of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        measurementDate: "2022-01-26 02:03:30.118709",
      };
      await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.measurementDate).toEqual(body.measurementDate);
      });

      return await measurementRepository.findOneByIdOrThrow(fixtures.get("measurement20").id).then((res) => {
        expect(res.measurementDate).toEqual(body.measurementDate);
      });
    });

    it("should not update measurements with given id for normal user", async () => {
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement21").id}`,
        measurement50accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update measurements with given id for not jwt accessToken by admin_o", async () => {
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement21").id}`,
        "someToken",
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update measurements with given id for not existed user", async () => {
      const user: User = new User();
      user.id = faker.string.uuid();
      const accessToken: string = generatorService.generateAccessToken(user);
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement21").id}`,
        accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not update measurements with given id for wrong signed jwt accessToken", async () => {
      const accessToken: string =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement21").id}`,
        accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    it("should not update measurement with given not existed id for for admin_0", async () => {
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${faker.string.uuid()}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not delete measurements with given ids for measurements with not uuid for admin_0", async () => {
      const body: BodyCRUD = {
        weight: 100,
      };
      return await patchAuthCRUD("/measurements/updatebyid/wrongId1", admin_0_12accessToken, body, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
      );
    });

    it("should not update if weight is not number of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        weight: "100",
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update if calloriesDelivered is not number of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        caloriesDelivered: "2100",
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update if distanceTraveled is not number of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        distanceTraveled: "21",
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update if measurementDate is not string of measurement with given id for admin_0", async () => {
      const body: BodyCRUD = {
        measurementDate: 2022,
      };
      return await patchAuthCRUD(
        `/measurements/updatebyid/${fixtures.get("measurement20").id}`,
        admin_0_12accessToken,
        body,
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
