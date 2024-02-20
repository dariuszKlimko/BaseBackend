import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe, ExecutionContext, CallHandler } from "@nestjs/common";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/load.fixtures";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { Request } from "express";
import { BodyCRUD } from "@test/helpers/types/body";
import { deleteCRUD, getCRUD, patchCRUD, postCRUD } from "@test/helpers/crud/crud";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";

describe("Measurements (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let measurementRepository: MeasurementRepository;

  beforeEach(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideInterceptor(AddUserToRequest)
      .useValue({
        intercept: (context: ExecutionContext, next: CallHandler) => {
          const req: Request = context.switchToHttp().getRequest<Request>();
          req.body.user = fixtures.get("user5");
          return next.handle();
        },
      })
      .overrideGuard(JwtAuthGuard)
      .useValue(true)
      .compile();

    measurementRepository = moduleFixture.get(MeasurementRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe("/measurements (POST) - create measurement", () => {
    it("should create measurement in database and correctly calculate BMI", async () => {
      const measurement: BodyCRUD = {
        weight: 77,
        caloriesDelivered: 1900,
        distanceTraveled: 5,
        measurementDate: "2023-01-26 02:03:30.118709",
      };
      const userHeight = fixtures.get("profile5").height;
      const bmi = +(Number(measurement.weight) / Math.pow(userHeight / 100, 2)).toFixed(2);
      let id: string;
      await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.measurementDate).toEqual(measurement.measurementDate);
        expect(res.body.weight).toEqual(measurement.weight);
        expect(res.body.bmi).toEqual(bmi);
        id = res.body.id;
      });

      return await measurementRepository.findOneByIdOrThrow(id).then((measure) => {
        expect(measure.measurementDate).toEqual(measurement.measurementDate);
        expect(measure.weight).toEqual(measurement.weight);
        expect(measure.bmi).toEqual(bmi);
      });
    });

    it("should not create measurement if weight is not number", async () => {
      const measurement: BodyCRUD = {
        weight: "77",
        caloriesDelivered: 1900,
        distanceTraveled: 5,
        measurementDate: "2023-01-26 02:03:30.118709",
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create measurement if calloriesDelivered is not number", async () => {
      const measurement: BodyCRUD = {
        weight: 77,
        caloriesDelivered: "1900",
        distanceTraveled: 5,
        measurementDate: "2023-01-26 02:03:30.118709",
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create measurement if distanceTraveled is not number", async () => {
      const measurement: BodyCRUD = {
        weight: 77,
        caloriesDelivered: 1900,
        distanceTraveled: "5",
        measurementDate: "2023-01-26 02:03:30.118709",
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create measurement if measurementDate is not string", async () => {
      const measurement: BodyCRUD = {
        weight: 77,
        caloriesDelivered: 1900,
        distanceTraveled: 5,
        measurementDate: 2023,
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create measurement if weight property is not existing", async () => {
      const measurement: BodyCRUD = {
        caloriesDelivered: 1900,
        distanceTraveled: 5,
        measurementDate: "2023-01-26 02:03:30.118709",
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not create measurement if measurementDate property is not existing", async () => {
      const measurement: BodyCRUD = {
        weight: 77,
        caloriesDelivered: 1900,
        distanceTraveled: 5,
      };
      return await postCRUD("/measurements", measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/measurements (GET) - get all measurements", () => {
    it("should get all measurements of user", async () => {
      return await getCRUD("/measurements", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(4);
      });
    });

    it("should return empty array if there is no measurements for user", async () => {
      await deleteCRUD("/measurements", app);
      return await getCRUD("/measurements", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body[0].length).toEqual(0);
      });
    });
  });

  describe("/measurements/one/:id (GET) - get one measurement", () => {
    it("should get one measurement for user  with given accessToken", async () => {
      return await getCRUD(`/measurements/one/${fixtures.get("measurement5").id}`, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.id).toEqual(fixtures.get("measurement5").id);
        expect(res.body.userId).toEqual(fixtures.get("measurement5").userId);
      });
    });

    it("should not get one measurement for user  with given accessToken which is not owner of measurement", async () => {
      return await getCRUD(`/measurements/one/${fixtures.get("measurement1").id}`, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not get one measurement with wrong id for user with given accessToken", async () => {
      return await getCRUD("/measurements/one/fcbe637d-6472-4033-8862-b1553990422f", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not get one measurement with id not uuid type for user with given accessToken", async () => {
      return await getCRUD("/measurements/one/notUUUIDmeasurementId", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/measurements/one/:id (PATCH) - update measurement", () => {
    it("should update measurement for given user ith accessToken", async () => {
      const measurement: BodyCRUD = {
        weight: 67,
        caloriesDelivered: 1500,
        distanceTraveled: 3,
        measurementDate: "2023-01-16 02:03:30.118709",
      };
      await patchCRUD(`/measurements/one/${fixtures.get("measurement5").id}`, measurement, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.weight).toEqual(measurement.weight);
        expect(res.body.caloriesDelivered).toEqual(measurement.caloriesDelivered);
        expect(res.body.distanceTraveled).toEqual(measurement.distanceTraveled);
        expect(res.body.measurementDate).toEqual(measurement.measurementDate);
      });

      return await measurementRepository.findOneByIdOrThrow(fixtures.get("measurement5").id).then((measure) => {
        expect(measure.weight).toEqual(measurement.weight);
        expect(measure.caloriesDelivered).toEqual(measurement.caloriesDelivered);
        expect(measure.distanceTraveled).toEqual(measurement.distanceTraveled);
        expect(measure.measurementDate).toEqual(measurement.measurementDate);
      });
    });

    it("should not update measurement with wrong id for user with given accessToken", async () => {
      const measurement: BodyCRUD = {
        weight: 67,
        caloriesDelivered: 1500,
        distanceTraveled: 3,
        measurementDate: "2023-01-16 02:03:30.118709",
      };
      return await patchCRUD(`/measurements/one/${fixtures.get("measurement1").id}`, measurement, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.NOT_FOUND);
        }
      );
    });

    it("should not update measurement when weight is not number", async () => {
      return await patchCRUD(`/measurements/one/${fixtures.get("measurement5").id}`, { weight: "76" }, app).then(
        (res) => {
          expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
      );
    });

    it("should not update measurement when caloriesDelivered is not number", async () => {
      return await patchCRUD(
        `/measurements/one/${fixtures.get("measurement5").id}`,
        { caloriesDelivered: "1976" },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update measurement when distanceTraveled is not number", async () => {
      return await patchCRUD(
        `/measurements/one/${fixtures.get("measurement5").id}`,
        { distanceTraveled: "9" },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it("should not update measurement when measurementDate is not number", async () => {
      return await patchCRUD(
        `/measurements/one/${fixtures.get("measurement5").id}`,
        { measurementDate: 567789 },
        app
      ).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe("/measurements (DELETE) - delete all measurments", () => {
    it("should delete all measurements for user with given accessToken", async () => {
      const userId: string = fixtures.get("user5").id;
      const allMeasurementsLenght: number = await measurementRepository
        .findAllByCondition({ userId })
        .then((res) => res[0].length);
      await deleteCRUD("/measurements", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.length).toEqual(allMeasurementsLenght);
      });

      return await measurementRepository
        .findAllByCondition({ userId: fixtures.get("user5").id })
        .then((measurements) => {
          expect(measurements[0]).toEqual([]);
        });
    });
  });

  describe("/measurements/one/:id (DELETE) - delete one measurments", () => {
    it("should delete one measurement for user with given accessToken", async () => {
      const userId: string = fixtures.get("user5").id;
      const allMeasurementsLenght: number = await measurementRepository
        .findAllByCondition({ userId })
        .then((res) => res[0].length);
      await deleteCRUD(`/measurements/one/${fixtures.get("measurement5").id}`, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body.userId).toEqual(userId);
      });

      await expect(
        measurementRepository.findOneByIdOrThrow(fixtures.get("measurement5").id)
      ).rejects.toThrow(EntityNotFound);

      return await measurementRepository.findAllByCondition({ userId }).then((measurements) => {
        expect(measurements[0].length).toEqual(allMeasurementsLenght - 1);
      });
    });

    it("should not delete one measurement with for wrong user with given accessToken", async () => {
      return await deleteCRUD(`/measurements/one/${fixtures.get("measurement1").id}`, app).then((res) => {
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    it("should not delete one measurement if id is not uuid type for user with given accessToken", async () => {
      return await deleteCRUD("/measurements/one/someNotUUIDmeasurementId", app).then((res) => {
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
