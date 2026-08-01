import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSessionDto {
  @ApiProperty({
    example: "user_12345",
  })
  @IsString()
  @IsNotEmpty()
  declare userId: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  declare refreshToken: string;

  @ApiProperty({
    example: "2026-08-02T00:00:00.000Z",
    description: "Session refresh token expiry timestamp",
  })
  declare expiresAt: Date;
}

export class GetSessionByUserAndSessionDto {
  @ApiProperty({
    example: "user_12345",
  })
  @IsString()
  @IsNotEmpty()
  declare userId: string;

  @ApiProperty({
    example: "session_67890",
  })
  @IsString()
  @IsNotEmpty()
  declare sessionId: string;
}
