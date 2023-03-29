import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe, ExecutionContext } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app.module";
import loadFixtures, { FixtureFactory } from "@test/helpers/loadFixtures";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { Repository } from "typeorm";
import { Measurement } from "@app/modules/measurements/entities/measurement.entity";

describe("Measurements (e2e)", () => {
  let app: INestApplication;
  let fixtures: FixtureFactory;
  let measurementRepository: Repository<Measurement>;

  beforeEach(async () => {
    fixtures = await loadFixtures();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: fixtures.get("user5").id};
        return true;
      },
    })
    .compile();

    measurementRepository = moduleFixture.get("MeasurementRepository")

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe("/measurements (POST) - create measurement", () => {
    it("should create measurement in database", async () => {
      const measurement = {
        "weight": 77,
        "caloriesDelivered": 1900,
        "distanceTraveled": 5,
        "measurementDate": "2023-01-26 02:03:30.118709"
      }
      let id: string;
      await request.default(app.getHttpServer())
        .post("/measurements")
        .send(measurement)
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.CREATED);
          expect(res.body.measurementDate).toEqual(measurement.measurementDate);
          expect(res.body.weight).toEqual(measurement.weight);
          id = res.body.id;
        })

      return measurementRepository.findOneBy({ id }).then((measure) => {
        expect(measure.measurementDate).toEqual(measurement.measurementDate);
        expect(measure.weight).toEqual(measurement.weight);
      })
    });
  });

  describe("/measurements (GET) - get all measurements", () => {
    it("should get all measurements of user", () => {
      return request.default(app.getHttpServer())
        .get("/measurements")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body.length).toEqual(4);
        })
    });

    it("should return empty array if there id no measurements for user", async() => {
      await request.default(app.getHttpServer()).delete("/measurements");
      return request.default(app.getHttpServer())
        .get("/measurements")
        .then((res) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body).toEqual([]);
        })
    });
  });

  describe("/measurements/:id (GET) - get one measurement", () => {
    it("should get one measurement of user", () => {});
  });

  describe("/measurements/:id (PATCH) - update measurement", () => {
    it("should update one measurement of user", () => {});
  });

  describe("/measurements (DELETE) - delete all measurments", () => {
    it("should delete all measurements of user", () => {});
  });

  describe("/measurements/:id (DELETE) - delete one measurments", () => {
    it("should delete one measurement of user", () => {});
  });
});
