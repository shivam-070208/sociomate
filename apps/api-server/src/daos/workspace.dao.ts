import { PrismaService } from "@/shared/db/prisma.service";
import { Prisma } from "@repo/db";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class WorkspaceDao {
  constructor(private readonly prisma: PrismaService) {}

  public async createWorkspace(data: {
    name: string;
    slug: string;
    logo?: string;
    ownerId: string;
  }) {
    try {
      return await this.prisma.client.workspace.create({ data });
    } catch (error) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError;
      if (
        prismaError instanceof Prisma.PrismaClientKnownRequestError &&
        prismaError.code === "P2002"
      ) {
        throw new ConflictException("Workspace with this slug already exists");
      }
      throw error;
    }
  }

  public async getWorkspacesByOwnerId(ownerId: string) {
    return await this.prisma.client.workspace.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  public async getWorkspaceBySlug(slug: string) {
    return await this.prisma.client.workspace.findUnique({ where: { slug } });
  }

  public async updateWorkspace(
    slug: string,
    ownerId: string,
    data: { name?: string; slug?: string; logo?: string },
  ) {
    const updateData: { name?: string; slug?: string; logo?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.logo !== undefined) updateData.logo = data.logo;

    try {
      const result = await this.prisma.client.workspace.updateMany({
        where: { slug, ownerId },
        data: updateData,
      });
      if (result.count === 0) {
        throw new NotFoundException("Workspace not found");
      }
      const lookupSlug = data.slug ?? slug;
      return await this.prisma.client.workspace.findUnique({
        where: { slug: lookupSlug },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const prismaError = error as Prisma.PrismaClientKnownRequestError;
      if (
        prismaError instanceof Prisma.PrismaClientKnownRequestError &&
        prismaError.code === "P2002"
      ) {
        throw new ConflictException("Slug already in use by another workspace");
      }
      throw error;
    }
  }

  public async deleteWorkspace(slug: string, ownerId: string) {
    const result = await this.prisma.client.workspace.deleteMany({
      where: { slug, ownerId },
    });
    if (result.count === 0) {
      throw new NotFoundException("Workspace not found");
    }
  }
}
