import { IsArray, IsEmail, IsNotEmpty } from "class-validator";

export class EmailArrayDto {
  @IsNotEmpty()
  @IsArray()
  @IsEmail(undefined, { each: true })
  emails: string[];
}
