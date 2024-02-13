import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class UuuidArrayDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID("all", { each: true })
  ids: string[];
}
