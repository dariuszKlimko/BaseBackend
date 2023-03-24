import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty()
  email: string;
}
