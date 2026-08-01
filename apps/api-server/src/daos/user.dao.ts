import { CreateUserWithEmailProviderDto } from "@/dtos/user.dao.dto";
import { PrismaService } from "@/shared/db/prisma.service";
import { ConflictException, Injectable } from "@nestjs/common";
import { Providers } from "@repo/db";

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  public async createUserWithEmailProvider(
    createUserDto: CreateUserWithEmailProviderDto,
  ) {
    const { email, name, password, otp } = createUserDto;
    const existingUser = await this.prisma.client.$primary().user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ConflictException("User already exist with this emails");
    }
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
                otp,
              },
            },
          },
        },
      },
    });
  }
}
