import { Module } from "@nestjs/common";
import { WorkspaceModule } from "@/modules/workspace/workspace.module";
import { SocialAccountDao } from "@/daos/social-account.dao";
import { SocialAccountController } from "./controllers/social-account.controller";
import { SocialAccountService } from "./services/social-account.service";

@Module({
  imports: [WorkspaceModule],
  controllers: [SocialAccountController],
  providers: [SocialAccountService, SocialAccountDao],
  exports: [SocialAccountService],
})
export class SocialAccountModule {}
