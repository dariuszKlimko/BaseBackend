import { PASSWORD_REGEX, weakPasswordMessage } from "@app/common/password";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, IsStrongPassword, Matches } from "class-validator";

export class CreateUserDto {
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
}
