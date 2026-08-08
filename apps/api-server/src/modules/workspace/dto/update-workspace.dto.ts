import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: "My Updated Workspace" })
  @IsOptional()
  @IsString()
  declare name?: string;

  @ApiPropertyOptional({ example: "my-updated-workspace" })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be URL-friendly (lowercase alphanumeric with hyphens)",
  })
  declare slug?: string;

  @ApiPropertyOptional({ example: "https://example.com/new-logo.png" })
  @IsOptional()
  @IsString()
  declare logo?: string;
}
