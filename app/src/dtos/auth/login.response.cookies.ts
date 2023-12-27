import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseCookies {
  @ApiProperty()
  accessToken: string;
}
