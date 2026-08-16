import { Injectable } from "@nestjs/common";
import { SocialAccountProvider } from "@repo/db";
import { SocialAccountProviderService } from "./social-account-provider.service";

@Injectable()
export class WhatsAppProviderService extends SocialAccountProviderService {
  public readonly provider = SocialAccountProvider.WHATSAPP;

  public getRenewedTokenLifetime(): number {
    return 30 * 24 * 60 * 60 * 1000;
  }
}
