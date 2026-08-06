import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { RegisterUserDto } from "./dto/register-user.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { UserDao } from "@/daos/user.dao";
import { OtpDao } from "@/daos/otp.dao";
import { SessionDao } from "@/daos/session.dao";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";
import { LoginUserDto } from "./dto/login-user.dto";
import { RabbitPublisher } from "@repo/queue";
import { AccountDao } from "@/daos/account.dao";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userDao: UserDao,
    private readonly otpDao: OtpDao,
    private readonly jwtService: JwtService,
    private readonly sessionDao: SessionDao,
    private readonly userInfoProvider: UserInfoProvider,
    private readonly rabbitPublisher: RabbitPublisher,
    private readonly accountDao: AccountDao,
  ) {}

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const scryptAsync = promisify(scryptCallback);
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  private async hashOtp(otp: string) {
    const salt = randomBytes(16).toString("hex");
    const scryptAsync = promisify(scryptCallback);
    const derived = (await scryptAsync(otp, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  private async verifyHash(password: string, storedPassword: string) {
    const [salt, key] = storedPassword.split(":");
    if (!salt || !key) {
      return false;
    }
    const scryptAsync = promisify(scryptCallback);
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const keyBuffer = Buffer.from(key, "hex");
    if (keyBuffer.length !== derived.length) {
      return false;
    }
    return timingSafeEqual(derived, keyBuffer);
  }

  private generateOtpCode() {
    return randomInt(100000, 1000000).toString().padStart(6, "0");
  }

  private generateAuthToken() {
    return randomBytes(32).toString("hex");
  }

  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto;
    this.validateField(email, "Email is required");
    this.validateField(password, "Password is required");
    const otp = this.generateOtpCode();
    const hashedPassword = await this.hashPassword(password);
    const otpHash = await this.hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const user = await this.userDao.createUserWithEmailProvider({
      email,
      password: hashedPassword,
      name,
      otpHash,
      expiresAt: otpExpiresAt,
    });

    await this.rabbitPublisher.publishOtp({
      userId: user.id,
      email,
      otp,
      expiresAt: otpExpiresAt.toISOString(),
    });

    const refreshToken = this.generateAuthToken();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await this.sessionDao.createSession({
      userId: user.id,
      expiresAt: sessionExpiresAt,
      refreshToken,
    });
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      sessionId: session.id,
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;
    this.validateField(email, "Email is required");

    const user = await this.userDao.getUserByEmail(email);
    this.validateField(user, "User not found");

    const account = user.accounts?.[0];
    this.validateField(account, "User does not have an email account");

    await this.otpDao.deactivateOtpsForAccount(account.id);

    const otp = this.generateOtpCode();
    console.log(otp);
    const otpHash = await this.hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpDao.createOtpForAccount(account.id, otpHash, otpExpiresAt);
    await this.rabbitPublisher.publishOtp({
      userId: user.id,
      email,
      otp,
      expiresAt: otpExpiresAt.toISOString(),
    });

    return { message: "OTP resent successfully." };
  }

  public async verifyOtp(email: string, verifyOtpDto: VerifyOtpDto) {
    this.validateField(email, "Email  ID is required");
    this.validateField(verifyOtpDto?.otp, "OTP is required");

    const user = await this.userDao.getUserByEmail(email);
    this.validateField(user, "User not found");

    const account = user.accounts?.[0];
    this.validateField(account, "User does not have an email account");

    const otpRecord = account?.otp[0];
    this.validateField(otpRecord, "OTP not found or expired");

    const isOtpValid = await this.verifyHash(verifyOtpDto.otp, otpRecord.otp);
    if (!isOtpValid) {
      throw new BadRequestException("Invalid OTP");
    }

    await this.accountDao.verifyEmailAndDeactivateOtps(account.id);

    const otpVerifiedToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        otpVerified: true,
      },
      { expiresIn: "2m" },
    );

    return {
      message: "OTP verified successfully.",
      otpVerifiedToken,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    };
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userDao.getUserByEmail(email);
    this.validateField(user, "Invalid Credentials");
    const accounts = user?.accounts[0];
    this.validateField(
      accounts,
      "User has no password set , try forgot passwd and set a new password",
    );
    this.validateField(
      accounts?.passwordHash,
      "User has no password set , try forgot passwd and set a new password",
    );

    const isVerified = await this.verifyHash(password, accounts?.passwordHash);

    if (!isVerified) {
      throw new BadRequestException("Invalid credentials");
    }

    delete (user as unknown as { accounts?: unknown }).accounts;
    const refreshToken = this.generateAuthToken();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await this.sessionDao.createSession({
      userId: user.id,
      expiresAt: sessionExpiresAt,
      refreshToken,
    });
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      sessionId: session.id,
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
  public getProfile() {
    return this.userInfoProvider.getUser();
  }
  public async validateToken(token: string) {
    try {
      const decryptedToken = await this.jwtService.verifyAsync<{
        sub: string;
        sessionId: string;
      }>(token);
      const { sub: userId, sessionId } = decryptedToken;
      if (!userId || !sessionId) {
        return null;
      }

      const session = await this.sessionDao.getSessionByUserIdAndSessionId({
        userId,
        sessionId,
      });

      if (!session || session.expiresAt <= new Date()) {
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  private validateField(value: unknown, message: string): asserts value {
    if (!value) {
      throw new BadRequestException(message);
    }
  }
}
