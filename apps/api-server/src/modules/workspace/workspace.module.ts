import { Module } from "@nestjs/common";
import { WorkspaceController } from "./controllers/workspace.controller";
import { WorkspaceService } from "./services/workspace.service";
import { WorkspaceDao } from "@/daos/workspace.dao";
import { PrismaModule } from "@/shared/db/prisma.module";
import { AuthenticationModule } from "../authentication/authentication.module";

@Module({
  imports: [PrismaModule, AuthenticationModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceDao],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
