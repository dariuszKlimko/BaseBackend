import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMeasurementDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  caloriesDelivered: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  distanceTraveled: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  measurementDate: string;
}
