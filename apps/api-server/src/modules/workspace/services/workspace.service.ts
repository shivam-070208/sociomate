import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspaceDao } from "@/daos/workspace.dao";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "../dto/update-workspace.dto";

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceDao: WorkspaceDao) {}

  public async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const slug = dto.slug ?? this.toSlug(dto.name);

    return await this.workspaceDao.createWorkspace({
      name: dto.name,
      slug,
      logo: dto.logo,
      ownerId: userId,
    });
  }

  public async listWorkspaces(userId: string) {
    return await this.workspaceDao.getWorkspacesByOwnerId(userId);
  }

  public async getWorkspace(userId: string, slug: string) {
    const workspace = await this.workspaceDao.getWorkspaceBySlug(slug);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not own this workspace");
    }
    return workspace;
  }

  public async updateWorkspace(
    userId: string,
    slug: string,
    dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.workspaceDao.getWorkspaceBySlug(slug);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not own this workspace");
    }

    return await this.workspaceDao.updateWorkspace(slug, {
      name: dto.name,
      slug: dto.slug,
      logo: dto.logo,
    });
  }

  public async deleteWorkspace(userId: string, slug: string) {
    const workspace = await this.workspaceDao.getWorkspaceBySlug(slug);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not own this workspace");
    }

    await this.workspaceDao.deleteWorkspace(slug);
    return { message: "Workspace deleted successfully" };
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
