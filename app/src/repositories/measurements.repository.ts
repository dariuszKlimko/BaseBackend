import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { Measurement } from "@app/entities/measurement.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MeasurementRepositoryInterface } from "./interfaces/measurements.repository.interface";

export class MeasurementsRepository extends BaseAbstractRepository<Measurement, CreateMeasurementDto, UpdateMeasurementDto> implements MeasurementRepositoryInterface {
    constructor(@InjectRepository(Measurement) private readonly measurementRepository: Repository<Measurement>) {
        super(measurementRepository, "dddd");
    }
}