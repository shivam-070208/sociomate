jest.mock("@/modules/authentication/authentication.service", () => ({
  AuthenticationService: class AuthenticationService {},
}));

import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationController } from "@/modules/authentication/authentication.controller";
import { AuthenticationService } from "@/modules/authentication/authentication.service";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { OtpVerifyGuard } from "@/shared/guards/otp.verify.guard";

describe("AuthenticationController", () => {
  let controller: AuthenticationController;
  let service: jest.Mocked<AuthenticationService>;

  const mockAuthenticationService = {
    registerUser: jest.fn(),
    resendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    loginUser: jest.fn(),
    getProfile: jest.fn(),
    resetPassword: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(OtpVerifyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthenticationController>(AuthenticationController);

    service = module.get(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      const dto = {
        email: "user@example.com",
        password: "StrongP@ssw0rd",
        name: "Jane Doe",
      };

      const response = {
        user: {
          id: "123",
          email: "user@example.com",
          name: "Jane Doe",
          avatar: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: "access",
        refreshToken: "refresh",
      };

      service.registerUser.mockResolvedValue(response);

      const result = await controller.registerUser(dto);

      expect(service.registerUser).toHaveBeenCalledWith(dto);

      expect(result).toEqual(response);
    });

    it("should propagate service error", async () => {
      service.registerUser.mockRejectedValue(new Error("Service Error"));

      await expect(
        controller.registerUser({
          email: "test@test.com",
          password: "password123",
        }),
      ).rejects.toThrow("Service Error");
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const dto = {
        email: "test@test.com",
        password: "password123",
      };

      const response = {
        user: {
          id: "123",
          email: "user10@example.com",
          name: "Jane Doe",
          avatar: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          accounts: [],
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      service.loginUser.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(service.loginUser).toHaveBeenCalledWith(dto);

      expect(result).toEqual(response);
    });

    it("should throw login error", async () => {
      service.loginUser.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        controller.login({
          email: "wrong@test.com",
          password: "wrong",
        }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("resendOtp", () => {
    it("should resend otp", async () => {
      const dto = {
        email: "test@test.com",
      };

      service.resendOtp.mockResolvedValue({
        message: "OTP resent successfully",
      });

      const result = await controller.resendOtp(dto);

      expect(service.resendOtp).toHaveBeenCalledWith(dto);

      expect(result).toEqual({
        message: "OTP resent successfully",
      });
    });

    it("should propagate resend otp error", async () => {
      service.resendOtp.mockRejectedValue(new Error("User not found"));

      await expect(
        controller.resendOtp({
          email: "test@test.com",
        }),
      ).rejects.toThrow("User not found");
    });
  });

  describe("verifyOtp", () => {
    it("should verify otp", async () => {
      const email = "test@test.com";

      const dto = {
        otp: "123456",
      };

      const response = {
        message: "OTP verified successfully",
        expiresAt: "",
        otpVerifiedToken: "",
      };

      service.verifyOtp.mockResolvedValue(response);

      const result = await controller.verifyOtp(email, dto);

      expect(service.verifyOtp).toHaveBeenCalledWith(email, dto);

      expect(result).toEqual(response);
    });

    it("should throw invalid otp error", async () => {
      service.verifyOtp.mockRejectedValue(new Error("Invalid OTP"));

      await expect(
        controller.verifyOtp("test@test.com", {
          otp: "111111",
        }),
      ).rejects.toThrow("Invalid OTP");
    });
  });

  describe("getProfile", () => {
    it("should return profile", () => {
      const profile = {
        id: "9764b190-3078-4472-896c-3788fc855d3a",
        userId: "2f53743e-66cd-4cf6-96ac-eceaa10eb4b2",
        refreshToken:
          "a971c23946cffa4ca8b0e996744e1119e5caa29c1c413aae6752fed6d5598453",
        userAgent: null,
        ipAddress: null,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "2f53743e-66cd-4cf6-96ac-eceaa10eb4b2",
          email: "user10@example.com",
          name: "Jane Doe",
          avatar: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      service.getProfile.mockReturnValue(profile);

      const result = controller.getProfile();

      expect(service.getProfile).toHaveBeenCalled();

      expect(result).toEqual(profile);
    });
  });

  describe("resetPassword", () => {
    it("should reset password", async () => {
      const dto = {
        newpassword: "NewPassword123",
      };

      const req = {
        useremail: "test@test.com",
      };

      const response = {
        message: "Password update successfully",
        status: "200",
      };

      service.resetPassword.mockResolvedValue(response);

      const result = await controller.resetPassword(
        dto,
        req as unknown as Request,
      );

      expect(service.resetPassword).toHaveBeenCalledWith(dto, "test@test.com");

      expect(result).toEqual(response);
    });

    it("should throw reset password error", async () => {
      service.resetPassword.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        controller.resetPassword(
          {
            newpassword: "12345678",
          },
          {
            useremail: "test@test.com",
          } as unknown as Request,
        ),
      ).rejects.toThrow("Invalid credentials");
    });
  });
});
