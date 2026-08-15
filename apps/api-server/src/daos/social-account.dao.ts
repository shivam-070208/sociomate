import { Injectable } from "@nestjs/common";
import { SocialAccountProvider } from "@repo/db";
import { PrismaService } from "@/shared/db/prisma.service";

interface CreateSocialAccountData {
  workspaceId: string;
  provider: SocialAccountProvider;
  providerAccountId: string;
  username?: string;
  displayName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

interface UpdateSocialAccountData {
  username?: string;
  displayName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

@Injectable()
export class SocialAccountDao {
  constructor(private readonly prisma: PrismaService) {}

  public async createSocialAccount(
    createSocialAccountData: CreateSocialAccountData,
  ) {
    return await this.prisma.client.socialAccount.create({
      data: {
        workspaceId: createSocialAccountData.workspaceId,
        provider: createSocialAccountData.provider,
        providerAccountId: createSocialAccountData.providerAccountId,
        username: createSocialAccountData.username,
        displayName: createSocialAccountData.displayName,
        accessToken: createSocialAccountData.accessToken,
        refreshToken: createSocialAccountData.refreshToken,
        tokenExpiresAt: createSocialAccountData.tokenExpiresAt,
      },
    });
  }

  public async getSocialAccountByIdAndWorkspaceId(
    socialAccountId: string,
    workspaceId: string,
  ) {
    return await this.prisma.client.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        workspaceId,
      },
    });
  }

  public async getSocialAccountsByWorkspaceId(workspaceId: string) {
    return await this.prisma.client.socialAccount.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async getSocialAccountByProviderAndProviderAccountId(
    workspaceId: string,
    provider: SocialAccountProvider,
    providerAccountId: string,
  ) {
    return await this.prisma.client.socialAccount.findFirst({
      where: {
        workspaceId,
        provider,
        providerAccountId,
      },
    });
  }

  public async updateSocialAccount(
    socialAccountId: string,
    updateSocialAccountData: UpdateSocialAccountData,
  ) {
    return await this.prisma.client.socialAccount.update({
      where: {
        id: socialAccountId,
      },
      data: {
        username: updateSocialAccountData.username,
        displayName: updateSocialAccountData.displayName,
        accessToken: updateSocialAccountData.accessToken,
        refreshToken: updateSocialAccountData.refreshToken,
        tokenExpiresAt: updateSocialAccountData.tokenExpiresAt,
      },
    });
  }

  public async deleteSocialAccount(socialAccountId: string) {
    return await this.prisma.client.socialAccount.delete({
      where: {
        id: socialAccountId,
      },
    });
  }
}
