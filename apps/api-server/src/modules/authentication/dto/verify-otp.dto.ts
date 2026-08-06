import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "482913" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  declare otp: string;
}
