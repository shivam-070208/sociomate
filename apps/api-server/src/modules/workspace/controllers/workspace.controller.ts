import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";
import { WorkspaceService } from "../services/workspace.service";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "../dto/update-workspace.dto";

@Controller("workspace")
@ApiTags("Workspace")
@UseGuards(AuthGuard)
@ApiBearerAuth("access-token")
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly userInfoProvider: UserInfoProvider,
  ) {}

  private getUserId(): string {
    const user = this.userInfoProvider.getUser();
    return user!.userId;
  }

  @Post()
  @ApiOperation({
    summary: "Create a workspace",
    description:
      "Creates a new workspace owned by the authenticated user. If no slug is provided it is auto-generated from the name.",
  })
  @ApiCreatedResponse({ description: "Workspace created successfully." })
  @ApiBadRequestResponse({
    description: "Name is missing or the slug is not URL-friendly.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  public async createWorkspace(@Body() dto: CreateWorkspaceDto) {
    return await this.workspaceService.createWorkspace(this.getUserId(), dto);
  }

  @Get()
  @ApiOperation({
    summary: "List workspaces",
    description: "Returns all workspaces owned by the authenticated user.",
  })
  @ApiOkResponse({ description: "List of the user's workspaces." })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  public async listWorkspaces() {
    return await this.workspaceService.listWorkspaces(this.getUserId());
  }

  @Get(":slug")
  @ApiOperation({
    summary: "Get workspace by slug",
    description:
      "Returns the workspace that matches the slug and is owned by the authenticated user.",
  })
  @ApiOkResponse({ description: "Workspace found." })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  @ApiNotFoundResponse({
    description: "Workspace not found or not owned by the user.",
  })
  public async getWorkspace(@Param("slug") slug: string) {
    return await this.workspaceService.getWorkspace(this.getUserId(), slug);
  }

  @Patch(":slug")
  @ApiOperation({
    summary: "Update a workspace",
    description:
      "Updates the name, slug and/or logo of the authenticated user's workspace.",
  })
  @ApiOkResponse({ description: "Workspace updated successfully." })
  @ApiBadRequestResponse({
    description: "Invalid payload or slug is not URL-friendly.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  @ApiNotFoundResponse({
    description: "Workspace not found or not owned by the user.",
  })
  public async updateWorkspace(
    @Param("slug") slug: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return await this.workspaceService.updateWorkspace(
      this.getUserId(),
      slug,
      dto,
    );
  }

  @Delete(":slug")
  @ApiOperation({
    summary: "Delete a workspace",
    description: "Deletes the authenticated user's workspace and its data.",
  })
  @ApiOkResponse({ description: "Workspace deleted successfully." })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  @ApiNotFoundResponse({
    description: "Workspace not found or not owned by the user.",
  })
  public async deleteWorkspace(@Param("slug") slug: string) {
    return await this.workspaceService.deleteWorkspace(this.getUserId(), slug);
  }
}
