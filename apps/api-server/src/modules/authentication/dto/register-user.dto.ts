import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "StrongP@ssw0rd" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: "Jane Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
