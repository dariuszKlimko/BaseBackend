import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "@app/entities/measurement/measurement.entity";
import { Repository } from "typeorm";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { UsersService } from "@app/services/user.service";
import { MeasurementNotFoundException } from "@app/common/exceptions/measurement/measurementNotFound.exception";
import { MessageInfo } from "@app/common/types/messageInfo";

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement) private measurementsRepository: Repository<Measurement>,
    private usersService: UsersService
  ) {}

  async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement> {
    const user = await this.usersService.getUser(userId);
    let bmi: number;
    const measurement = await this.measurementsRepository.create(measurementPayload);
    measurement.userId = userId;
    if (user.height) {
      bmi = measurementPayload.weight / Math.pow(user.height / 100, 2);
      measurement.bmi = +bmi.toFixed(2);
    }
    return await this.measurementsRepository.save(measurement);
  }

  async getAllMeasurements(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.findBy({ userId });
  }

  async getOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
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
    const measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.update({ userId, id: measurementId }, measurementPayload);
    return await this.measurementsRepository.findOneBy({ userId, id: measurementId });
  }

  async deleteAllMeasurementsByUserId(userId: string): Promise<MessageInfo> {
    const measurements = await this.measurementsRepository.findBy({ userId });
    if (measurements.length === 0) {
      throw new MeasurementNotFoundException("measurements for given user id not found");
    }
    await this.measurementsRepository.delete({ userId });
    return { status: "ok", message: "all measurements deleted" };
  }

  async deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement = await this.measurementsRepository.findOneBy({ userId, id: measurementId });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.delete({ userId, id: measurementId });
    return measurement;
  }
}
