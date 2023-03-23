import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateMeasurementDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
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
    @IsOptional()
    measurementDate: string;
}