import { Injectable } from "@nestjs/common";
import {
  CreateSessionDto,
  GetSessionByUserAndSessionDto,
} from "@/dtos/session.dao.dto";
import { PrismaService } from "@/shared/db/prisma.service";

@Injectable()
export class SessionDao {
  constructor(private readonly prismaService: PrismaService) {}

  public async createSession(createSessionDto: CreateSessionDto) {
    const { userId, refreshToken, expiresAt } = createSessionDto;
    return this.prismaService.client.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });
  }
  public async getSessionByUserIdAndSessionId(
    getSessionByUserIdAndSessionIdDto: GetSessionByUserAndSessionDto,
  ) {
    const { sessionId, userId } = getSessionByUserIdAndSessionIdDto;
    return this.prismaService.client.$primary().session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        user: true,
      },
    });
  }
}
