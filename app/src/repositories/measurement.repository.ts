import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { Measurement } from "@app/entities/measurement.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MeasurementRepositoryInterface } from "@app/common/types/interfaces/repositories/measurements.repository.interface";
import { MEASUREMENTS_NOT_FOUND } from "@app/common/constans/constans";

export class MeasurementRepository
  extends BaseAbstractRepository<Measurement>
  implements MeasurementRepositoryInterface
{
  constructor(@InjectRepository(Measurement) measurementRepository: Repository<Measurement>) {
    super(measurementRepository, MEASUREMENTS_NOT_FOUND);
  }
}
