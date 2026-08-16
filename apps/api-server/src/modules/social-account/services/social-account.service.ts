import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspaceService } from "@/modules/workspace/services/workspace.service";
import { SocialAccountDao } from "@/daos/social-account.dao";
import { SocialAccount } from "@repo/db";
import { ConnectSocialAccountDto } from "../dto/connect-social-account.dto";
import { UpdateSocialAccountDto } from "../dto/update-social-account.dto";
import { SocialAccountProviderResolver } from "@/shared/providers/social-account-providers/social-account-provider.resolver";

type SafeSocialAccount = {
  id: string;
  workspaceId: string;
  provider: SocialAccount["provider"];
  providerAccountId: string | null;
  username: string | null;
  displayName: string | null;
  status: SocialAccount["status"];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class SocialAccountService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly socialAccountDao: SocialAccountDao,
    private readonly socialAccountProviderResolver: SocialAccountProviderResolver,
  ) {}

  private async getWorkspaceIdBySlugForOwner(
    userId: string,
    workspaceslug: string,
  ) {
    const workspace = await this.workspaceService.getWorkspace(
      userId,
      workspaceslug,
    );
    return workspace.id;
  }

  private toSafeSocialAccount(socialAccount: SocialAccount): SafeSocialAccount {
    return {
      id: socialAccount.id,
      workspaceId: socialAccount.workspaceId,
      provider: socialAccount.provider,
      providerAccountId: socialAccount.providerAccountId,
      username: socialAccount.username,
      displayName: socialAccount.displayName,
      status: socialAccount.status,
      createdAt: socialAccount.createdAt,
      updatedAt: socialAccount.updatedAt,
    };
  }

  private async getOwnedSocialAccountById(
    userId: string,
    workspaceslug: string,
    socialAccountId: string,
  ): Promise<{ workspaceId: string; socialAccount: SocialAccount }> {
    const workspaceId = await this.getWorkspaceIdBySlugForOwner(
      userId,
      workspaceslug,
    );
    const socialAccount =
      await this.socialAccountDao.getSocialAccountByIdAndWorkspaceId(
        socialAccountId,
        workspaceId,
      );
    if (!socialAccount) {
      throw new NotFoundException("Social account not found");
    }
    return { workspaceId, socialAccount };
  }

  public async connectSocialAccount(
    userId: string,
    workspaceslug: string,
    connectSocialAccountDto: ConnectSocialAccountDto,
  ) {
    const workspaceId = await this.getWorkspaceIdBySlugForOwner(
      userId,
      workspaceslug,
    );
    const {
      provider,
      providerAccountId,
      username,
      displayName,
      accessToken,
      refreshToken,
      tokenExpiresAt,
    } = connectSocialAccountDto;

    const existingSocialAccount =
      await this.socialAccountDao.getSocialAccountByProviderAndProviderAccountId(
        workspaceId,
        provider,
        providerAccountId,
      );
    if (existingSocialAccount) {
      throw new ConflictException(
        "Social account is already connected to this workspace",
      );
    }

    const socialAccount = await this.socialAccountDao.createSocialAccount({
      workspaceId,
      provider,
      providerAccountId,
      username,
      displayName,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
    });

    return { socialAccount: this.toSafeSocialAccount(socialAccount) };
  }

  public async listSocialAccounts(userId: string, workspaceslug: string) {
    const workspaceId = await this.getWorkspaceIdBySlugForOwner(
      userId,
      workspaceslug,
    );
    const socialAccounts =
      await this.socialAccountDao.getSocialAccountsByWorkspaceId(workspaceId);
    return socialAccounts.map((socialAccount) =>
      this.toSafeSocialAccount(socialAccount),
    );
  }

  public async getSocialAccount(
    userId: string,
    workspaceslug: string,
    socialAccountId: string,
  ) {
    const { socialAccount } = await this.getOwnedSocialAccountById(
      userId,
      workspaceslug,
      socialAccountId,
    );
    return { socialAccount: this.toSafeSocialAccount(socialAccount) };
  }

  public async updateSocialAccount(
    userId: string,
    workspaceslug: string,
    socialAccountId: string,
    updateSocialAccountDto: UpdateSocialAccountDto,
  ) {
    const { socialAccount } = await this.getOwnedSocialAccountById(
      userId,
      workspaceslug,
      socialAccountId,
    );
    const updatedSocialAccount =
      await this.socialAccountDao.updateSocialAccount(socialAccount.id, {
        username: updateSocialAccountDto.username,
        displayName: updateSocialAccountDto.displayName,
      });
    return { socialAccount: this.toSafeSocialAccount(updatedSocialAccount) };
  }

  public async disconnectSocialAccount(
    userId: string,
    workspaceslug: string,
    socialAccountId: string,
  ) {
    const { socialAccount } = await this.getOwnedSocialAccountById(
      userId,
      workspaceslug,
      socialAccountId,
    );
    await this.socialAccountDao.deleteSocialAccount(socialAccount.id);
    return { message: "Social account disconnected successfully" };
  }

  public async refreshSocialAccount(
    userId: string,
    workspaceslug: string,
    socialAccountId: string,
  ) {
    const { socialAccount } = await this.getOwnedSocialAccountById(
      userId,
      workspaceslug,
      socialAccountId,
    );
    const providerService =
      this.socialAccountProviderResolver.resolveProviderService(
        socialAccount.provider,
      );
    const renewedCredentials = providerService.renewAccessToken();
    const refreshedSocialAccount =
      await this.socialAccountDao.updateSocialAccount(socialAccount.id, {
        tokenExpiresAt: renewedCredentials.tokenExpiresAt,
      });
    return { socialAccount: this.toSafeSocialAccount(refreshedSocialAccount) };
  }
}
