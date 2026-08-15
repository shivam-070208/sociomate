import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSocialAccountDto {
  @ApiPropertyOptional({ example: "mybrand" })
  @IsOptional()
  @IsString()
  declare username?: string;

  @ApiPropertyOptional({ example: "My Brand" })
  @IsOptional()
  @IsString()
  declare displayName?: string;
}
