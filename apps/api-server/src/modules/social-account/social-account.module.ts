import { Module } from "@nestjs/common";
import { WorkspaceModule } from "@/modules/workspace/workspace.module";
import { SocialAccountDao } from "@/daos/social-account.dao";
import { SocialAccountController } from "./controllers/social-account.controller";
import { SocialAccountService } from "./services/social-account.service";
import { InstagramProviderService } from "./services/providers/instagram.service";
import { WhatsAppProviderService } from "./services/providers/whatsapp.service";
import { TelegramProviderService } from "./services/providers/telegram.service";
import { SocialAccountProviderResolver } from "./services/providers/social-account-provider.resolver";

@Module({
  imports: [WorkspaceModule],
  controllers: [SocialAccountController],
  providers: [
    SocialAccountService,
    SocialAccountDao,
    InstagramProviderService,
    WhatsAppProviderService,
    TelegramProviderService,
    SocialAccountProviderResolver,
  ],
  exports: [SocialAccountService],
})
export class SocialAccountModule {}
