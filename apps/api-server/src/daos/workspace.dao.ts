import { PrismaService } from "@/shared/db/prisma.service";
import { Prisma } from "@repo/db";
import { ConflictException, Injectable } from "@nestjs/common";

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
    data: { name?: string; slug?: string; logo?: string },
  ) {
    const updateData: { name?: string; slug?: string; logo?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.logo !== undefined) updateData.logo = data.logo;

    try {
      return await this.prisma.client.workspace.update({
        where: { slug },
        data: updateData,
      });
    } catch (error) {
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

  public async deleteWorkspace(slug: string) {
    return await this.prisma.client.workspace.delete({ where: { slug } });
  }
}
