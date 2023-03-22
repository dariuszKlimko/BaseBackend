import { ApiProperty } from "@nestjs/swagger";

export class MessageInfo {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;
}
