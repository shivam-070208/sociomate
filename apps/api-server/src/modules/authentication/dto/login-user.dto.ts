import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @ApiProperty({ example: "Strong@Passwd" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  declare password: string;
}
