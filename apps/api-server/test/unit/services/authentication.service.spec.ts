import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException } from "@nestjs/common";
import { Session, User, Account, Otp, Providers } from "@repo/db";
import { RabbitPublisher } from "@repo/queue";
import { AuthenticationService } from "@/modules/authentication/authentication.service";
import { UserDao } from "@/daos/user.dao";
import { OtpDao } from "@/daos/otp.dao";
import { SessionDao } from "@/daos/session.dao";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";
import { RegisterUserDto } from "@/modules/authentication/dto/register-user.dto";
import { LoginUserDto } from "@/modules/authentication/dto/login-user.dto";
import { ResendOtpDto } from "@/modules/authentication/dto/resend-otp.dto";
import { VerifyOtpDto } from "@/modules/authentication/dto/verify-otp.dto";

type UserWithAccounts = User & { accounts: (Account & { otp: Otp[] })[] };
type SessionWithUser = Session & { user: User };
type MockedService<T> = { [K in keyof T]: jest.Mock };

interface VerifyHashable {
  verifyHash: (password: string, storedPassword: string) => Promise<boolean>;
}

function mockVerifyHash(spy: AuthenticationService, value: boolean) {
  jest
    .spyOn(spy as unknown as VerifyHashable, "verifyHash")
    .mockResolvedValue(value);
}

describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let userDao: MockedService<UserDao>;
  let otpDao: MockedService<OtpDao>;
  let jwtService: MockedService<JwtService>;
  let sessionDao: MockedService<SessionDao>;
  let rabbitPublisher: MockedService<RabbitPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserDao,
          useValue: {
            createUserWithEmailProvider: jest.fn(),
            getUserByEmail: jest.fn(),
            verifyEmailAndDeactivateOtp: jest.fn(),
            findAndUpsertPasswordByEmail: jest.fn(),
          },
        },
        {
          provide: OtpDao,
          useValue: {
            deactivateOtpsForAccount: jest.fn(),
            createOtpForAccount: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: SessionDao,
          useValue: {
            createSession: jest.fn(),
            getSessionByUserIdAndSessionId: jest.fn(),
          },
        },
        {
          provide: UserInfoProvider,
          useValue: {
            getUser: jest.fn(),
          },
        },
        {
          provide: RabbitPublisher,
          useValue: {
            publishOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userDao = module.get(UserDao);
    otpDao = module.get(OtpDao);
    jwtService = module.get(JwtService);
    sessionDao = module.get(SessionDao);
    rabbitPublisher = module.get(RabbitPublisher);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("registerUser", () => {
    it("should register a new user and return tokens", async () => {
      const registerUserDto: RegisterUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      const user: User = {
        id: "user-id",
        email: registerUserDto.email,
        name: registerUserDto.name ?? null,
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const session: Session = {
        id: "session-id",
        userId: user.id,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        refreshToken: "token",
      };

      userDao.createUserWithEmailProvider.mockResolvedValue(user);
      sessionDao.createSession.mockResolvedValue(session);
      jwtService.signAsync.mockResolvedValue("fake-access-token");

      const result = await service.registerUser(registerUserDto);

      expect(userDao.createUserWithEmailProvider).toHaveBeenCalled();
      expect(rabbitPublisher.publishOtp).toHaveBeenCalled();
      expect(sessionDao.createSession).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        sessionId: session.id,
      });
      expect(result).toHaveProperty("user", user);
      expect(result).toHaveProperty("accessToken", "fake-access-token");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw BadRequestException if email is not provided", async () => {
      const registerUserDto: RegisterUserDto = {
        email: "",
        password: "password123",
        name: "Test User",
      };
      await expect(service.registerUser(registerUserDto)).rejects.toThrow(
        new BadRequestException("Email is required"),
      );
    });
  });

  describe("loginUser", () => {
    it("should login a user and return tokens", async () => {
      const loginUserDto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const user: UserWithAccounts = {
        id: "user-id",
        email: loginUserDto.email,
        name: "Test User",
        avatar: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: "account-id",
            provider: Providers.EMAIL,
            providerAccountId: "test@example.com",
            passwordHash: "hashed-password",
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user-id",
            otp: [],
          },
        ],
      };
      const session: Session = {
        id: "session-id",
        userId: user.id,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        refreshToken: "token",
      };

      userDao.getUserByEmail.mockResolvedValue(user);
      mockVerifyHash(service, true);
      sessionDao.createSession.mockResolvedValue(session);
      jwtService.signAsync.mockResolvedValue("fake-access-token");

      const result = await service.loginUser(loginUserDto);

      expect(userDao.getUserByEmail).toHaveBeenCalledWith(loginUserDto.email);
      expect(sessionDao.createSession).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        sessionId: session.id,
      });
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken", "fake-access-token");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw BadRequestException for invalid credentials", async () => {
      const loginUserDto: LoginUserDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };
      const user: UserWithAccounts = {
        id: "user-id",
        email: loginUserDto.email,
        name: "Test User",
        avatar: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: "account-id",
            provider: Providers.EMAIL,
            providerAccountId: "test@example.com",
            passwordHash: "hashed-password",
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user-id",
            otp: [],
          },
        ],
      };

      userDao.getUserByEmail.mockResolvedValue(user);
      mockVerifyHash(service, false);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        new BadRequestException("Invalid credentials"),
      );
    });

    it("should throw BadRequestException if user not found", async () => {
      const loginUserDto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      userDao.getUserByEmail.mockResolvedValue(null);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        new BadRequestException("Invalid Credentials"),
      );
    });
  });

  describe("verifyOtp", () => {
    it("should verify otp and return otpVerifiedToken", async () => {
      const email = "test@example.com";
      const verifyOtpDto: VerifyOtpDto = { otp: "123456" };
      const user: UserWithAccounts = {
        id: "user-id",
        email,
        name: "Test User",
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: "account-id",
            provider: Providers.EMAIL,
            providerAccountId: email,
            passwordHash: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user-id",
            otp: [
              {
                id: "otp-id",
                otp: "hashed:otp",
                createdAt: new Date(),
                expiresAt: new Date(),
                isActive: true,
                accountId: "account-id",
              },
            ],
          },
        ],
      };

      userDao.getUserByEmail.mockResolvedValue(user);
      mockVerifyHash(service, true);
      jwtService.signAsync.mockResolvedValue("otp-verified-token");

      const result = await service.verifyOtp(email, verifyOtpDto);

      expect(userDao.getUserByEmail).toHaveBeenCalledWith(email);
      expect(userDao.verifyEmailAndDeactivateOtp).toHaveBeenCalledWith(
        user.id,
        "otp-id",
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: email, otpVerified: true },
        { expiresIn: "2m" },
      );
      expect(result).toHaveProperty("message", "OTP verified successfully.");
      expect(result).toHaveProperty("otpVerifiedToken", "otp-verified-token");
    });

    it("should throw BadRequestException for invalid OTP", async () => {
      const email = "test@example.com";
      const verifyOtpDto: VerifyOtpDto = { otp: "wrong-otp" };
      const user: UserWithAccounts = {
        id: "user-id",
        email,
        name: "Test User",
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: "account-id",
            provider: Providers.EMAIL,
            providerAccountId: email,
            passwordHash: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user-id",
            otp: [
              {
                id: "otp-id",
                otp: "hashed:otp",
                createdAt: new Date(),
                expiresAt: new Date(),
                isActive: true,
                accountId: "account-id",
              },
            ],
          },
        ],
      };

      userDao.getUserByEmail.mockResolvedValue(user);
      mockVerifyHash(service, false);

      await expect(service.verifyOtp(email, verifyOtpDto)).rejects.toThrow(
        new BadRequestException("Invalid OTP"),
      );
    });
  });

  describe("resendOtp", () => {
    it("should resend an OTP", async () => {
      const resendOtpDto: ResendOtpDto = { email: "user@example.com" };
      const user: UserWithAccounts = {
        id: "user-id",
        email: "user@example.com",
        name: "Test User",
        avatar: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: "account-id",
            provider: Providers.EMAIL,
            providerAccountId: "user@example.com",
            passwordHash: "hash",
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user-id",
            otp: [],
          },
        ],
      };

      userDao.getUserByEmail.mockResolvedValue(user);

      const result = await service.resendOtp(resendOtpDto);

      expect(userDao.getUserByEmail).toHaveBeenCalledWith(resendOtpDto.email);
      expect(otpDao.deactivateOtpsForAccount).toHaveBeenCalledWith(
        "account-id",
      );
      expect(otpDao.createOtpForAccount).toHaveBeenCalled();
      expect(rabbitPublisher.publishOtp).toHaveBeenCalled();
      expect(result).toEqual({ message: "OTP resent successfully." });
    });
  });

  describe("resetPassword", () => {
    it("should reset user password", async () => {
      const resetPasswordDto = { newpassword: "newPassword123" };
      const userEmail = "test@example.com";

      const result = await service.resetPassword(resetPasswordDto, userEmail);

      expect(userDao.findAndUpsertPasswordByEmail).toHaveBeenCalledWith(
        userEmail,
        expect.any(String),
      );
      expect(result).toEqual({
        message:
          "Password update successfully, now you can login with new credentials",
        status: "200",
      });
    });
  });

  describe("validateToken", () => {
    it("should validate a token and return the session", async () => {
      const token = "valid-token";
      const decodedToken = { sub: "user-id", sessionId: "session-id" };
      const session: SessionWithUser = {
        id: "session-id",
        userId: "user-id",
        expiresAt: new Date(Date.now() + 10000),
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: "token",
        userAgent: null,
        ipAddress: null,
        user: {
          id: "user-id",
          email: "test@example.com",
          name: "Test User",
          avatar: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      jwtService.verifyAsync.mockResolvedValue(decodedToken);
      sessionDao.getSessionByUserIdAndSessionId.mockResolvedValue(session);

      const result = await service.validateToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(sessionDao.getSessionByUserIdAndSessionId).toHaveBeenCalledWith({
        userId: "user-id",
        sessionId: "session-id",
      });
      expect(result).toEqual(session);
    });

    it("should return null for an invalid token", async () => {
      const token = "invalid-token";
      jwtService.verifyAsync.mockRejectedValue(new Error("Invalid token"));

      const result = await service.validateToken(token);

      expect(result).toBeNull();
    });

    it("should return null for an expired session", async () => {
      const token = "valid-token-expired-session";
      const decodedToken = { sub: "user-id", sessionId: "session-id" };
      const session: SessionWithUser = {
        id: "session-id",
        userId: "user-id",
        expiresAt: new Date(Date.now() - 10000),
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: "token",
        userAgent: null,
        ipAddress: null,
        user: {
          id: "user-id",
          email: "test@example.com",
          name: "Test User",
          avatar: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      jwtService.verifyAsync.mockResolvedValue(decodedToken);
      sessionDao.getSessionByUserIdAndSessionId.mockResolvedValue(session);

      const result = await service.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
