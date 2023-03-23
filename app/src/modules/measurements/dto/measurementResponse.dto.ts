import { ApiProperty } from "@nestjs/swagger";

export class MeasurementResponseDto {
    @ApiProperty()
    weight: number;

    @ApiProperty()
    measurementDate: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    bmi: number;

    @ApiProperty()
    caloriesDelivered: number;

    @ApiProperty()
    distanceTraveled: number;

    @ApiProperty()
    id: string;
}