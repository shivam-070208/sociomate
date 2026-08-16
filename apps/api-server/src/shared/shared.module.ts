import { Global, Module } from "@nestjs/common";
import { UserInfoProvider } from "./providers/userinfo.provider";
import { PrismaModule } from "./db/prisma.module";
import { InstagramProviderService } from "./providers/social-account-providers/instagram.service";
import { WhatsAppProviderService } from "./providers/social-account-providers/whatsapp.service";
import { TelegramProviderService } from "./providers/social-account-providers/telegram.service";
import { SocialAccountProviderResolver } from "./providers/social-account-providers/social-account-provider.resolver";

@Global()
@Module({
  providers: [
    UserInfoProvider,
    InstagramProviderService,
    WhatsAppProviderService,
    TelegramProviderService,
    SocialAccountProviderResolver,
  ],
  imports: [PrismaModule],
  exports: [
    UserInfoProvider,
    InstagramProviderService,
    WhatsAppProviderService,
    TelegramProviderService,
    SocialAccountProviderResolver,
  ],
})
export class SharedModule {}
