import { Module } from "@nestjs/common";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";

@Module({
  imports: [],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [],
})
export class SystemModule {}
