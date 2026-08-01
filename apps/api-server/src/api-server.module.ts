import { Module } from "@nestjs/common";
import { AppController } from "./api-server.controller";
import { AppService } from "./api-server.service";
import { SystemModule } from "@/modules/system/system.module";
import { SharedModule } from "./shared/shared.module";
import { AuthenticationModule } from "@/modules/authentication/authentication.module";

@Module({
  imports: [SystemModule, SharedModule, AuthenticationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppApiServerModule {}
