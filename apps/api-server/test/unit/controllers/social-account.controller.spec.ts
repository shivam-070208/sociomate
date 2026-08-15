jest.mock("@/modules/social-account/services/social-account.service", () => ({
  SocialAccountService: class SocialAccountService {},
}));

import { Test, TestingModule } from "@nestjs/testing";
import { SocialAccountController } from "@/modules/social-account/controllers/social-account.controller";
import { SocialAccountService } from "@/modules/social-account/services/social-account.service";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";
import { SocialAccountProvider } from "@repo/db";

describe("SocialAccountController", () => {
  let controller: SocialAccountController;
  let service: jest.Mocked<SocialAccountService>;
  let userInfoProvider: jest.Mocked<UserInfoProvider>;

  const mockSocialAccountService = {
    connectSocialAccount: jest.fn(),
    listSocialAccounts: jest.fn(),
    getSocialAccount: jest.fn(),
    updateSocialAccount: jest.fn(),
    disconnectSocialAccount: jest.fn(),
    refreshSocialAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialAccountController],
      providers: [
        {
          provide: SocialAccountService,
          useValue: mockSocialAccountService,
        },
        {
          provide: UserInfoProvider,
          useValue: {
            getUser: jest.fn(() => ({ userId: "user-id" })),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<SocialAccountController>(SocialAccountController);
    service = module.get(SocialAccountService);
    userInfoProvider = module.get(UserInfoProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("connectSocialAccount", () => {
    it("should connect a social account", async () => {
      const dto = {
        provider: SocialAccountProvider.INSTAGRAM,
        providerAccountId: "17841400573998367",
      };
      const response = { socialAccount: { id: "social-account-id" } };

      service.connectSocialAccount.mockResolvedValue(response as never);

      const result = await controller.connectSocialAccount("my-workspace", dto);

      expect(userInfoProvider.getUser).toHaveBeenCalled();
      expect(service.connectSocialAccount).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
        dto,
      );
      expect(result).toEqual(response);
    });
  });

  describe("listSocialAccounts", () => {
    it("should list social accounts", async () => {
      const response = [{ socialAccount: { id: "social-account-id" } }];

      service.listSocialAccounts.mockResolvedValue(response as never);

      const result = await controller.listSocialAccounts("my-workspace");

      expect(service.listSocialAccounts).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
      );
      expect(result).toEqual(response);
    });
  });

  describe("getSocialAccount", () => {
    it("should get a social account", async () => {
      const response = { socialAccount: { id: "social-account-id" } };

      service.getSocialAccount.mockResolvedValue(response as never);

      const result = await controller.getSocialAccount(
        "my-workspace",
        "social-account-id",
      );

      expect(service.getSocialAccount).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
        "social-account-id",
      );
      expect(result).toEqual(response);
    });
  });

  describe("updateSocialAccount", () => {
    it("should update a social account", async () => {
      const dto = { username: "newbrand" };
      const response = { socialAccount: { id: "social-account-id" } };

      service.updateSocialAccount.mockResolvedValue(response as never);

      const result = await controller.updateSocialAccount(
        "my-workspace",
        "social-account-id",
        dto,
      );

      expect(service.updateSocialAccount).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
        "social-account-id",
        dto,
      );
      expect(result).toEqual(response);
    });
  });

  describe("refreshSocialAccount", () => {
    it("should refresh a social account", async () => {
      const response = { socialAccount: { id: "social-account-id" } };

      service.refreshSocialAccount.mockResolvedValue(response as never);

      const result = await controller.refreshSocialAccount(
        "my-workspace",
        "social-account-id",
      );

      expect(service.refreshSocialAccount).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
        "social-account-id",
      );
      expect(result).toEqual(response);
    });
  });

  describe("disconnectSocialAccount", () => {
    it("should disconnect a social account", async () => {
      const response = { message: "Social account disconnected successfully" };

      service.disconnectSocialAccount.mockResolvedValue(response as never);

      const result = await controller.disconnectSocialAccount(
        "my-workspace",
        "social-account-id",
      );

      expect(service.disconnectSocialAccount).toHaveBeenCalledWith(
        "user-id",
        "my-workspace",
        "social-account-id",
      );
      expect(result).toEqual(response);
    });
  });
});
