import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { PrismaModule } from "@/shared/db/prisma.module";
import { UserDao } from "@/daos/user.dao";

@Module({
  imports: [PrismaModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserDao],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
