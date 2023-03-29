import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height: number;
}
