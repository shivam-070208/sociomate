import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateWorkspaceDto {
  @ApiProperty({ example: "My Workspace" })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({ example: "my-workspace", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be URL-friendly (lowercase alphanumeric with hyphens)",
  })
  declare slug?: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false })
  @IsOptional()
  @IsString()
  declare logo?: string;
}
