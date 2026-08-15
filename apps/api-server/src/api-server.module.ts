import { Module } from "@nestjs/common";
import { AppController } from "./api-server.controller";
import { AppService } from "./api-server.service";
import { SystemModule } from "@/modules/system/system.module";
import { SharedModule } from "./shared/shared.module";
import { AuthenticationModule } from "@/modules/authentication/authentication.module";
import { WorkspaceModule } from "@/modules/workspace/workspace.module";
import { SocialAccountModule } from "@/modules/social-account/social-account.module";
import { PrismaModule } from "./shared/db/prisma.module";
import { RabbitModule } from "@repo/queue";

@Module({
  imports: [
    PrismaModule,
    RabbitModule,
    SystemModule,
    SharedModule,
    AuthenticationModule,
    WorkspaceModule,
    SocialAccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppApiServerModule {}
