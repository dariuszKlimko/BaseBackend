import { PartialType } from "@nestjs/swagger";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";

export class UpdateMeasurementDto extends PartialType(CreateMeasurementDto) {}
