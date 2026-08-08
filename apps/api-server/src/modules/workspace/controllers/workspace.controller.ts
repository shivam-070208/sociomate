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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
  public async createWorkspace(@Body() dto: CreateWorkspaceDto) {
    return await this.workspaceService.createWorkspace(this.getUserId(), dto);
  }

  @Get()
  public async listWorkspaces() {
    return await this.workspaceService.listWorkspaces(this.getUserId());
  }

  @Get(":slug")
  public async getWorkspace(@Param("slug") slug: string) {
    return await this.workspaceService.getWorkspace(this.getUserId(), slug);
  }

  @Patch(":slug")
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
  public async deleteWorkspace(@Param("slug") slug: string) {
    return await this.workspaceService.deleteWorkspace(this.getUserId(), slug);
  }
}
