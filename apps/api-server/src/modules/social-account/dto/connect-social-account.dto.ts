import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SocialAccountProvider } from "@repo/db";
import { IsEnum, IsISO8601, IsOptional, IsString } from "class-validator";

export class ConnectSocialAccountDto {
  @ApiProperty({ example: "INSTAGRAM", enum: SocialAccountProvider })
  @IsEnum(SocialAccountProvider)
  declare provider: SocialAccountProvider;

  @ApiProperty({ example: "17841400573998367" })
  @IsString()
  declare providerAccountId: string;

  @ApiPropertyOptional({ example: "mybrand" })
  @IsOptional()
  @IsString()
  declare username?: string;

  @ApiPropertyOptional({ example: "My Brand" })
  @IsOptional()
  @IsString()
  declare displayName?: string;

  @ApiPropertyOptional({
    example: "IGQVJ...access-token",
    description: "Provider access token used for authenticated calls",
  })
  @IsOptional()
  @IsString()
  declare accessToken?: string;

  @ApiPropertyOptional({
    example: "IGQVJ...refresh-token",
    description: "Provider refresh token used to renew the access token",
  })
  @IsOptional()
  @IsString()
  declare refreshToken?: string;

  @ApiPropertyOptional({
    example: "2026-08-16T00:00:00.000Z",
    description: "Access token expiry timestamp",
  })
  @IsOptional()
  @IsISO8601()
  declare tokenExpiresAt?: string;
}
