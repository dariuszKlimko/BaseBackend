import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class UpuidArrayDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID("all", { each: true })
  ids: string[];
}
