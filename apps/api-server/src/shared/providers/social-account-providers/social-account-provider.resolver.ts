import { BadRequestException, Injectable } from "@nestjs/common";
import { SocialAccountProvider } from "@repo/db";
import { SocialAccountProviderService } from "./social-account-provider.service";
import { InstagramProviderService } from "./instagram.service";
import { WhatsAppProviderService } from "./whatsapp.service";
import { TelegramProviderService } from "./telegram.service";

@Injectable()
export class SocialAccountProviderResolver {
  private readonly providerServicesByProvider: Record<
    string,
    SocialAccountProviderService
  >;

  constructor(
    instagramProviderService: InstagramProviderService,
    whatsAppProviderService: WhatsAppProviderService,
    telegramProviderService: TelegramProviderService,
  ) {
    this.providerServicesByProvider = {
      [SocialAccountProvider.INSTAGRAM]: instagramProviderService,
      [SocialAccountProvider.WHATSAPP]: whatsAppProviderService,
      [SocialAccountProvider.TELEGRAM]: telegramProviderService,
    };
  }

  public resolveProviderService(
    provider: SocialAccountProvider,
  ): SocialAccountProviderService {
    const providerService = this.providerServicesByProvider[provider];
    if (!providerService) {
      throw new BadRequestException("Unsupported social account provider");
    }
    return providerService;
  }
}
