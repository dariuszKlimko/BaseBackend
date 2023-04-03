import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class EmailResetDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}