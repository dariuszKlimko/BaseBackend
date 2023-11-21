import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "@app/entities/measurement.entity";
import { Repository } from "typeorm";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { MeasurementNotFoundException } from "@app/common/exceptions/measurement/measurementNotFound.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { ProfilesService } from "@app/services/profile.service";
import { Profile } from "@app/entities/profile.entity";
import { MEASUREMENTS_DELETED_RESPONSE } from "@app/common/constans/constans";

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement) private measurementsRepository: Repository<Measurement>,
    private profilesService: ProfilesService
  ) {}

  async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement> {
    let bmi: number;
    const profile: Profile = await this.profilesService.getProfile(userId);
    const measurement: Measurement = await this.measurementsRepository.create(measurementPayload);
    measurement.userId = userId;
    if (profile.height) {
      bmi = measurementPayload.weight / Math.pow(profile.height / 100, 2);
      measurement.bmi = +bmi.toFixed(2);
    }
    return await this.measurementsRepository.save(measurement);
  }

  async getAllMeasurements(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.findBy({ userId });
  }

  async getOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    return measurement;
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.update({ userId, id: measurementId }, measurementPayload);
    return await this.measurementsRepository.findOneBy({ userId, id: measurementId });
  }

  async deleteAllMeasurementsByUserId(userId: string): Promise<MessageInfo> {
    const measurements: Measurement[] = await this.measurementsRepository.findBy({ userId });
    if (measurements.length === 0) {
      throw new MeasurementNotFoundException("measurements for given user id not found");
    }
    await this.measurementsRepository.delete({ userId });
    return MEASUREMENTS_DELETED_RESPONSE;
  }

  async deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.delete({ userId, id: measurementId });
    return measurement;
  }

  // async getAllMeasurementsByAdmin() - admin

  // async getMeasurementsByIdsByAdmin() - admin

  // async getMeasurementsWithConditionByAdmin()????? - admin

  // async deleteMeasurementsByIdsByAdmin() - admin

  // async updateMeasurementsByAdmin() - admin
}
