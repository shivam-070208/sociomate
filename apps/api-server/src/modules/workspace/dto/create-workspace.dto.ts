import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWorkspaceDto {
  @ApiProperty({ example: "My Workspace" })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({ example: "my-workspace", required: false })
  @IsOptional()
  @IsString()
  declare slug?: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false })
  @IsOptional()
  @IsString()
  declare logo?: string;
}
