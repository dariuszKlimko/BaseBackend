import { PASSWORD_REGEX, weakPasswordMessage } from "@app/common/constans/password";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: weakPasswordMessage,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;
}
