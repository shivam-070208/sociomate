import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/db/prisma.service";
import { randomBytes, randomInt, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserDao } from "@/daos/user.dao";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userDao: UserDao,
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

  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto;
    this.validateField(email, "Email is required");
    this.validateField(password, "Password is required");
    const otp = this.generateOtpCode();
    const hashedPassword = await this.hashPassword(password);
    const otpHash = await this.hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const result = this.userDao.createUserWithEmailProvider({
      email,
      password: hashedPassword,
      name,
      otpHash,
      expiresAt: otpExpiresAt,
    });
    return result;
  }

  public validateToken(token: string) {
    return token;
  }

  private validateField(value: unknown, message: string) {
    if (!value) {
      throw new BadRequestException(message);
    }
  }
}
