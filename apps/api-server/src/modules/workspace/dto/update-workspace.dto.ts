import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: "My Updated Workspace" })
  @IsOptional()
  @IsString()
  declare name?: string;

  @ApiPropertyOptional({ example: "my-updated-workspace" })
  @IsOptional()
  @IsString()
  declare slug?: string;

  @ApiPropertyOptional({ example: "https://example.com/new-logo.png" })
  @IsOptional()
  @IsString()
  declare logo?: string;
}
