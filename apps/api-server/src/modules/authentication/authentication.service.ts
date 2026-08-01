import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomInt, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserDao } from "@/daos/user.dao";
import { SessionDao } from "@/daos/session.dao";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly sessionDao: SessionDao,
    private readonly userInfoProvider: UserInfoProvider,
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

  private validateField(value: unknown, message: string) {
    if (!value) {
      throw new BadRequestException(message);
    }
  }
}
