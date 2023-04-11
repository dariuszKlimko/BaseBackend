import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height: number;
}
