import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { SocialAccountProvider, SocialAccountStatus } from "@repo/db";
import { SocialAccountService } from "@/modules/social-account/services/social-account.service";
import { SocialAccountDao } from "@/daos/social-account.dao";
import { WorkspaceService } from "@/modules/workspace/services/workspace.service";
import { SocialAccountProviderResolver } from "@/modules/social-account/services/providers/social-account-provider.resolver";
import { ConnectSocialAccountDto } from "@/modules/social-account/dto/connect-social-account.dto";
import { UpdateSocialAccountDto } from "@/modules/social-account/dto/update-social-account.dto";

type MockedService<T> = { [K in keyof T]: jest.Mock };

const socialAccountStub = {
  id: "social-account-id",
  workspaceId: "workspace-id",
  provider: SocialAccountProvider.INSTAGRAM,
  providerAccountId: "17841400573998367",
  username: "mybrand",
  displayName: "My Brand",
  accessToken: "secret-access-token",
  refreshToken: "secret-refresh-token",
  tokenExpiresAt: new Date("2026-08-16T00:00:00.000Z"),
  status: SocialAccountStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("SocialAccountService", () => {
  let service: SocialAccountService;
  let workspaceService: MockedService<WorkspaceService>;
  let socialAccountDao: MockedService<SocialAccountDao>;
  let socialAccountProviderResolver: MockedService<SocialAccountProviderResolver>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAccountService,
        {
          provide: WorkspaceService,
          useValue: {
            getWorkspace: jest.fn(),
          },
        },
        {
          provide: SocialAccountDao,
          useValue: {
            createSocialAccount: jest.fn(),
            getSocialAccountsByWorkspaceId: jest.fn(),
            getSocialAccountByIdAndWorkspaceId: jest.fn(),
            getSocialAccountByProviderAndProviderAccountId: jest.fn(),
            updateSocialAccount: jest.fn(),
            deleteSocialAccount: jest.fn(),
          },
        },
        {
          provide: SocialAccountProviderResolver,
          useValue: {
            resolveProviderService: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SocialAccountService>(SocialAccountService);
    workspaceService = module.get(WorkspaceService);
    socialAccountDao = module.get(SocialAccountDao);
    socialAccountProviderResolver = module.get(SocialAccountProviderResolver);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("connectSocialAccount", () => {
    it("should connect a new social account and return safe account data", async () => {
      const connectSocialAccountDto: ConnectSocialAccountDto = {
        provider: SocialAccountProvider.INSTAGRAM,
        providerAccountId: "17841400573998367",
        username: "mybrand",
        displayName: "My Brand",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        tokenExpiresAt: "2026-08-16T00:00:00.000Z",
      };

      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByProviderAndProviderAccountId.mockResolvedValue(
        null,
      );
      socialAccountDao.createSocialAccount.mockResolvedValue(socialAccountStub);

      const result = await service.connectSocialAccount(
        "user-id",
        "my-workspace",
        connectSocialAccountDto,
      );

      expect(workspaceService.getWorkspace).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
      );
      expect(
        socialAccountDao.getSocialAccountByProviderAndProviderAccountId,
      ).toHaveBeenCalledWith(
        "workspace-id",
        SocialAccountProvider.INSTAGRAM,
        "17841400573998367",
      );
      expect(socialAccountDao.createSocialAccount).toHaveBeenCalledWith({
        workspaceId: "workspace-id",
        provider: SocialAccountProvider.INSTAGRAM,
        providerAccountId: "17841400573998367",
        username: "mybrand",
        displayName: "My Brand",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        tokenExpiresAt: new Date("2026-08-16T00:00:00.000Z"),
      });
      expect(result).toEqual({
        socialAccount: {
          id: socialAccountStub.id,
          workspaceId: socialAccountStub.workspaceId,
          provider: socialAccountStub.provider,
          providerAccountId: socialAccountStub.providerAccountId,
          username: socialAccountStub.username,
          displayName: socialAccountStub.displayName,
          status: socialAccountStub.status,
          createdAt: socialAccountStub.createdAt,
          updatedAt: socialAccountStub.updatedAt,
        },
      });
      expect(result).not.toHaveProperty("accessToken");
      expect(result).not.toHaveProperty("refreshToken");
    });

    it("should throw ConflictException when the provider account is already connected", async () => {
      const connectSocialAccountDto: ConnectSocialAccountDto = {
        provider: SocialAccountProvider.INSTAGRAM,
        providerAccountId: "17841400573998367",
      };

      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByProviderAndProviderAccountId.mockResolvedValue(
        socialAccountStub,
      );

      await expect(
        service.connectSocialAccount(
          "user-id",
          "my-workspace",
          connectSocialAccountDto,
        ),
      ).rejects.toThrow(
        new ConflictException(
          "Social account is already connected to this workspace",
        ),
      );
      expect(socialAccountDao.createSocialAccount).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if the workspace is not owned by the user", async () => {
      const connectSocialAccountDto: ConnectSocialAccountDto = {
        provider: SocialAccountProvider.INSTAGRAM,
        providerAccountId: "17841400573998367",
      };

      workspaceService.getWorkspace.mockRejectedValue(
        new NotFoundException("Workspace not found"),
      );

      await expect(
        service.connectSocialAccount(
          "user-id",
          "my-workspace",
          connectSocialAccountDto,
        ),
      ).rejects.toThrow(new NotFoundException("Workspace not found"));
    });
  });

  describe("listSocialAccounts", () => {
    it("should return safe account data for the workspace", async () => {
      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountsByWorkspaceId.mockResolvedValue([
        socialAccountStub,
      ]);

      const result = await service.listSocialAccounts(
        "user-id",
        "my-workspace",
      );

      expect(workspaceService.getWorkspace).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
      );
      expect(
        socialAccountDao.getSocialAccountsByWorkspaceId,
      ).toHaveBeenCalledWith("workspace-id");
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty("accessToken");
      expect(result[0]).not.toHaveProperty("refreshToken");
    });
  });

  describe("getSocialAccount", () => {
    it("should return a single owned social account", async () => {
      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByIdAndWorkspaceId.mockResolvedValue(
        socialAccountStub,
      );

      const result = await service.getSocialAccount(
        "user-id",
        "my-workspace",
        "social-account-id",
      );

      expect(
        socialAccountDao.getSocialAccountByIdAndWorkspaceId,
      ).toHaveBeenCalledWith("social-account-id", "workspace-id");
      expect(result.socialAccount).toHaveProperty("id", "social-account-id");
      expect(result.socialAccount).not.toHaveProperty("accessToken");
    });

    it("should throw NotFoundException when the social account is not found", async () => {
      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByIdAndWorkspaceId.mockResolvedValue(
        null,
      );

      await expect(
        service.getSocialAccount("user-id", "my-workspace", "unknown-id"),
      ).rejects.toThrow(new NotFoundException("Social account not found"));
    });
  });

  describe("updateSocialAccount", () => {
    it("should update username and display name", async () => {
      const updateSocialAccountDto: UpdateSocialAccountDto = {
        username: "newbrand",
        displayName: "New Brand",
      };

      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByIdAndWorkspaceId.mockResolvedValue(
        socialAccountStub,
      );
      socialAccountDao.updateSocialAccount.mockResolvedValue({
        ...socialAccountStub,
        username: "newbrand",
        displayName: "New Brand",
      });

      const result = await service.updateSocialAccount(
        "user-id",
        "my-workspace",
        "social-account-id",
        updateSocialAccountDto,
      );

      expect(socialAccountDao.updateSocialAccount).toHaveBeenCalledWith(
        "social-account-id",
        { username: "newbrand", displayName: "New Brand" },
      );
      expect(result.socialAccount).toHaveProperty("username", "newbrand");
      expect(result.socialAccount).toHaveProperty("displayName", "New Brand");
    });
  });

  describe("disconnectSocialAccount", () => {
    it("should delete the owned social account", async () => {
      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByIdAndWorkspaceId.mockResolvedValue(
        socialAccountStub,
      );
      socialAccountDao.deleteSocialAccount.mockResolvedValue(socialAccountStub);

      const result = await service.disconnectSocialAccount(
        "user-id",
        "my-workspace",
        "social-account-id",
      );

      expect(socialAccountDao.deleteSocialAccount).toHaveBeenCalledWith(
        "social-account-id",
      );
      expect(result).toEqual({
        message: "Social account disconnected successfully",
      });
    });
  });

  describe("refreshSocialAccount", () => {
    it("should renew token expiry using the provider service", async () => {
      const renewedTokenExpiresAt = new Date("2026-09-15T00:00:00.000Z");

      workspaceService.getWorkspace.mockResolvedValue({ id: "workspace-id" });
      socialAccountDao.getSocialAccountByIdAndWorkspaceId.mockResolvedValue(
        socialAccountStub,
      );
      socialAccountProviderResolver.resolveProviderService.mockReturnValue({
        renewAccessToken: () => ({ tokenExpiresAt: renewedTokenExpiresAt }),
        provider: SocialAccountProvider.INSTAGRAM,
        getRenewedTokenLifetime: jest.fn(),
      });
      socialAccountDao.updateSocialAccount.mockResolvedValue({
        ...socialAccountStub,
        tokenExpiresAt: renewedTokenExpiresAt,
      });

      const result = await service.refreshSocialAccount(
        "user-id",
        "my-workspace",
        "social-account-id",
      );

      expect(
        socialAccountProviderResolver.resolveProviderService,
      ).toHaveBeenCalledWith(SocialAccountProvider.INSTAGRAM);
      expect(socialAccountDao.updateSocialAccount).toHaveBeenCalledWith(
        "social-account-id",
        { tokenExpiresAt: renewedTokenExpiresAt },
      );
      expect(result.socialAccount).toHaveProperty("id", "social-account-id");
    });
  });
});
