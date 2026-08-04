import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/db/prisma.service";

@Injectable()
export class OtpDao {
  constructor(private readonly prisma: PrismaService) {}

  public async deactivateOtpsForAccount(accountId: string) {
    return this.prisma.client.otp.updateMany({
      where: {
        accountId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  public async createOtpForAccount(
    accountId: string,
    otpHash: string,
    expiresAt: Date,
  ) {
    return this.prisma.client.otp.create({
      data: {
        accountId,
        otp: otpHash,
        expiresAt,
        isActive: true,
      },
    });
  }
}
