import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { Measurement } from "@app/entities/measurement.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MeasurementRepositoryInterface } from "@app/repositories/interfaces/measurements.repository.interface";

export class MeasurementRepository
  extends BaseAbstractRepository<Measurement, CreateMeasurementDto, UpdateMeasurementDto>
  implements MeasurementRepositoryInterface
{
  constructor(
    @InjectRepository(Measurement) measurementRepository: Repository<Measurement>
  ) {
    super(measurementRepository, "Measurement not found");
  }
}
