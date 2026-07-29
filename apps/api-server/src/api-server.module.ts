import { Module } from "@nestjs/common";
import { AppController } from "./api-server.controller";
import { AppService } from "./api-server.service";
import { SystemModule } from "./modules/system/system.module";

@Module({
  imports: [SystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppApiServerModule {}
