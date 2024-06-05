import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";

export class OAuthCodeDto {
  @ApiProperty()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}
