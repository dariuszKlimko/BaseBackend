import { Injectable } from "@nestjs/common";
import { Measurement } from "@app/entities/measurement.entity";
import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import { Profile } from "@app/entities/profile.entity";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { MeasurementRepositoryInterface } from "@app/repositories/interfaces/measurements.repository.interface";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { MeasurementServiceIntrface } from "@app/services/interfaces/measurement.service.interface";
import { FindOptionsWhere, UpdateResult } from "typeorm";

@Injectable()
export class MeasurementsService implements MeasurementServiceIntrface {
  private readonly measurementsRepository: MeasurementRepositoryInterface;
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(measurementsRepository: MeasurementRepository, profileRepository: ProfileRepository) {
    this.measurementsRepository = measurementsRepository;
    this.profileRepository = profileRepository;
  }

  async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement> {
    let bmi: number;
    const profile: Profile = await this.profileRepository.findOneByConditionOrThrow({ userId });
    const measurement: Measurement = await this.measurementsRepository.createOne(measurementPayload);
    measurement.userId = userId;
    if (profile.height) {
      bmi = measurementPayload.weight / Math.pow(profile.height / 100, 2);
      measurement.bmi = +bmi.toFixed(2);
    }
    return await this.measurementsRepository.saveOneByEntity(measurement);
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneByConditionOrThrow({
      userId,
      id: measurementId,
    });
    await this.measurementsRepository.updateOne(measurement.id, measurementPayload);
    return this.measurementsRepository.findOneByIdOrThrow(measurement.id);
  }
  // ---------------------------------------------------------------
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
