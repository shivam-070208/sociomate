import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/db/prisma.service";
import { randomBytes, randomInt, scryptSync } from "node:crypto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserDao } from "@/daos/user.dao";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userDao: UserDao,
  ) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derived}`;
  }

  private generateOtpCode() {
    return randomInt(100000, 1000000).toString().padStart(6, "0");
  }

  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto;
    this.validateField(email, "Email is required");
    this.validateField(password, "Password is required");
    const otp = this.generateOtpCode();
    const hashedPassword = this.hashPassword(password);
    const result = this.userDao.createUserWithEmailProvider({
      email,
      password: hashedPassword,
      name,
      otp,
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
