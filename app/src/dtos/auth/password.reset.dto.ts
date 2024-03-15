import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";

export class ResetPasswordDto extends CreateUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;
}
