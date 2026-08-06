import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaModule } from "@/shared/db/prisma.module";
import { UserDao } from "@/daos/user.dao";
import { OtpDao } from "@/daos/otp.dao";
import { SessionDao } from "@/daos/session.dao";
import { RabbitModule } from "@repo/queue";
import { AccountDao } from "@/daos/account.dao";

@Module({
  imports: [
    PrismaModule,
    RabbitModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || "default-jwt-secret",
        signOptions: { expiresIn: "10m" },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UserDao,
    OtpDao,
    SessionDao,
    JwtStrategy,
    AccountDao,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
