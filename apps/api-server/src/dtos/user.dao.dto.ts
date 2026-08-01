import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Length,
} from "class-validator";

export class CreateUserWithEmailProviderDto {
  @ApiProperty({
    example: "user@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @ApiProperty({
    example: "StrongP@ssw0rd",
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  declare password: string;

  @ApiPropertyOptional({
    example: "Jane Doe",
  })
  @IsOptional()
  @IsString()
  declare name?: string;

  @ApiPropertyOptional({
    example: "482913",
    description: "OTP code for email verification/login",
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  declare otp: string;
}
