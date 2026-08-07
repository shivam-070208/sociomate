import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "StrongP@ssword" })
  @IsString()
  @MinLength(8)
  declare newpassword: string;
}
