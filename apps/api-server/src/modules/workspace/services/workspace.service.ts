import {
  BadRequestException,
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
    this.validateField(slug, "Workspace name must produce a valid slug");

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
    if (!workspace || workspace.ownerId !== userId) {
      throw new NotFoundException("Workspace not found");
    }
    return workspace;
  }

  public async updateWorkspace(
    userId: string,
    slug: string,
    dto: UpdateWorkspaceDto,
  ) {
    if (dto.slug !== undefined) {
      const slugToUpdate = this.toSlug(dto.slug);
      this.validateField(slugToUpdate, "Slug must produce a valid value");
    }

    return await this.workspaceDao.updateWorkspace(slug, userId, {
      name: dto.name,
      slug: dto.slug,
      logo: dto.logo,
    });
  }

  public async deleteWorkspace(userId: string, slug: string) {
    await this.workspaceDao.deleteWorkspace(slug, userId);
    return { message: "Workspace deleted successfully" };
  }

  private validateField(value: unknown, message: string): asserts value {
    if (!value) {
      throw new BadRequestException(message);
    }
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
