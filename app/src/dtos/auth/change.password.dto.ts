import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";

export class ChangePasswordDto {
  @ApiProperty()
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: WEAK_PASSWORD_MESSAGE,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: WEAK_PASSWORD_MESSAGE,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
