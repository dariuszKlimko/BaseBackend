import { Injectable, Logger } from "@nestjs/common";
import { Measurement } from "@app/entities/measurement.entity";
import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { MeasurementRepositoryInterface } from "@app/repositories/interfaces/measurements.repository.interface";
import { MeasurementServiceIntrface } from "@app/services/interfaces/measurement.service.interface";
import { FindOptionsWhere, UpdateResult } from "typeorm";

@Injectable()
export class MeasurementService implements MeasurementServiceIntrface {
  private readonly logger: Logger = new Logger(MeasurementService.name);
  private readonly measurementsRepository: MeasurementRepositoryInterface;

  constructor(measurementsRepository: MeasurementRepository) {
    this.measurementsRepository = measurementsRepository;
  }

  async saveOneByEntity(measurement: Measurement): Promise<Measurement> {
    return await this.measurementsRepository.saveOneByEntity(measurement);
  }

  async createOne(measurement: CreateMeasurementDto): Promise<Measurement> {
    return await this.measurementsRepository.createOne(measurement);
  }

  async findAllByCondition(condition: FindOptionsWhere<Measurement>): Promise<[Measurement[], number]> {
    return await this.measurementsRepository.findAllByCondition(condition);
  }

  async deleteOneByEntity(measurement: Measurement): Promise<Measurement> {
    return await this.measurementsRepository.deleteOneByEntity(measurement);
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<Measurement>): Promise<Measurement> {
    return await this.measurementsRepository.findOneByConditionOrThrow(condition);
  }

  async findOneByIdOrThrow(id: string): Promise<Measurement> {
    return await this.measurementsRepository.findOneByIdOrThrow(id);
  }

  async updateOne(id: string, measurementInfo: UpdateMeasurementDto): Promise<UpdateResult> {
    return await this.measurementsRepository.updateOne(id, measurementInfo);
  }

  async findAllByIds(ids: string[]): Promise<[Measurement[], number]> {
    return await this.measurementsRepository.findAllByIds(ids);
  }

  async deleteManyByEntities(measurements: Measurement[]): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByEntities(measurements);
  }

  async findAll(skip: number, take: number): Promise<[Measurement[], number]> {
    return await this.measurementsRepository.findAll(skip, take);
  }
}
