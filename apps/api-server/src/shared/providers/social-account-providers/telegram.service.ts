import { Injectable } from "@nestjs/common";
import { SocialAccountProvider } from "@repo/db";
import { SocialAccountProviderService } from "./social-account-provider.service";

@Injectable()
export class TelegramProviderService extends SocialAccountProviderService {
  public readonly provider = SocialAccountProvider.TELEGRAM;

  public getRenewedTokenLifetime(): number {
    return 7 * 24 * 60 * 60 * 1000;
  }
}
