import { PrismaService } from "@/shared/db/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountDao {
  constructor(private readonly prisma: PrismaService) {}

  public async verifyEmailAndDeactivateOtps(accountId: string) {
    return await this.prisma.client.account.update({
      where: {
        id: accountId,
      },
      data: {
        user: {
          update: {
            emailVerified: true,
          },
        },
        otp: {
          updateMany: {
            where: {},
            data: {
              isActive: false,
            },
          },
        },
      },
    });
  }
}
