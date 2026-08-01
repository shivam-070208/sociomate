import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
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
    description: "Derived OTP hash for email verification/login",
  })
  @IsString()
  declare otpHash: string;

  @ApiPropertyOptional({
    example: "2026-08-02T00:00:00.000Z",
    description: "OTP expiry timestamp",
  })
  declare expiresAt: Date;
}
