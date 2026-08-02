import { CreateUserWithEmailProviderDto } from "@/dtos/user.dao.dto";
import { PrismaService } from "@/shared/db/prisma.service";
import { Prisma } from "@repo/db";
import { ConflictException, Injectable } from "@nestjs/common";
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
        },
      },
    });
  }
}
