import { CreateUserWithEmailProviderDto } from "@/dtos/user.dao.dto";
import { PrismaService } from "@/shared/db/prisma.service";
import { Prisma } from "@repo/db";
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { Providers } from "@repo/db";

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  public async createUserWithEmailProvider(
    createUserDto: CreateUserWithEmailProviderDto,
  ) {
    const { email, name, password, otpHash, expiresAt } = createUserDto;

    try {
      return await this.prisma.client.user.create({
        data: {
          email,
          name,

          accounts: {
            create: {
              provider: Providers.EMAIL,
              passwordHash: password,
              providerAccountId: email,
              otp: {
                create: {
                  otp: otpHash,
                  expiresAt,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError;

      if (
        prismaError instanceof Prisma.PrismaClientKnownRequestError &&
        prismaError.code === "P2002"
      ) {
        throw new ConflictException("User already exists with this email");
      }
      throw error;
    }
  }

  public async getUserByEmail(email: string) {
    return await this.prisma.client.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      include: {
        accounts: {
          where: {
            provider: Providers.EMAIL,
          },
          take: 1,
          include: {
            otp: {
              where: {
                isActive: true,
                expiresAt: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
    });
  }

  public async verifyEmailAndDeactivateOtp(userId: string, otpId: string) {
    return await this.prisma.client.$transaction(async (tx) => {
      const consumedOtp = await tx.otp.updateMany({
        where: {
          id: otpId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      if (consumedOtp.count === 0) {
        throw new BadRequestException("OTP already consumed");
      }

      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerified: true,
        },
      });

      return user;
    });
  }

  public async findAndUpsertPasswordByEmail(
    userEmail: string,
    newPassword: string,
  ) {
    return await this.prisma.client.user.update({
      where: {
        email: userEmail,
      },
      data: {
        accounts: {
          upsert: {
            where: {
              provider_providerAccountId: {
                provider: Providers.EMAIL,
                providerAccountId: userEmail,
              },
            },
            create: {
              provider: Providers.EMAIL,
              passwordHash: newPassword,
            },
            update: {
              passwordHash: newPassword,
            },
          },
        },
      },
    });
  }
}
