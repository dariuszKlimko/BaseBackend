import { Injectable } from "@nestjs/common";
import { Measurement } from "@app/entities/measurement.entity";
import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import { Profile } from "@app/entities/profile.entity";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { MeasurementRepositoryInterface } from "@app/repositories/interfaces/measurements.repository.interface";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";

@Injectable()
export class MeasurementsService {
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
    return await this.measurementsRepository.saveOne(measurement);
  }

  async getAllMeasurementsByUserId(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.findAllByCondition({ userId });
  }

  async getOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    return await this.measurementsRepository.findOneByConditionOrThrow({
      userId,
      id: measurementId,
    });
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    return await this.measurementsRepository.updateOneByCondition({ 
      userId, 
      id: measurementId 
    },
      measurementPayload
    );
  }

  async deleteAllMeasurementsByUserId(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByCondition({ userId });
  }

  async deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    return await this.measurementsRepository.deleteOneByCondition({ userId, id: measurementId });
  }
  // ---------------------------------------------------------------
  // Admin
  async getAllMeasurementsByAdmin(): Promise<Measurement[]> {
    return await this.measurementsRepository.findAll();
  }
  // Admin
  async getAllMeasurementsByIdsByAdmin(ids: string[]): Promise<Measurement[]> {
    return await this.measurementsRepository.findAllByIds(ids);
  }
  // Admin
  async deleteMeasurementsByIdsByAdmin(ids: string[]): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByIds(ids);
  }
  // Admin
  async deleteMeasurementsByUserIdByAdmin(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByCondition({ userId });
  }
  // Admin
  async updateMeasurementByIdByAdmin(id: string, measurementPayload: UpdateMeasurementDto): Promise<Measurement> {
    return await this.measurementsRepository.updateOneById(id, measurementPayload);
  }
}
