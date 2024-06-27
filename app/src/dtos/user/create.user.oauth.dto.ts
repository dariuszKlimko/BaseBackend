import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";
import { ExternalProvider } from "@app/common/types/enum/external.provider.enum";
import { Role } from "@app/common/types/enum/role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateUserOAuthDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  verified: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ExternalProvider, { each: true })
  @IsString()
  provider: ExternalProvider.GOOGLE | ExternalProvider.FACEBOOK | ExternalProvider.X;
}
