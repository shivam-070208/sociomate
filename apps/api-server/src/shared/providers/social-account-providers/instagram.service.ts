import { Injectable } from "@nestjs/common";
import { SocialAccountProvider } from "@repo/db";
import { SocialAccountProviderService } from "./social-account-provider.service";

@Injectable()
export class InstagramProviderService extends SocialAccountProviderService {
  public readonly provider = SocialAccountProvider.INSTAGRAM;

  public getRenewedTokenLifetime(): number {
    return 60 * 24 * 60 * 60 * 1000;
  }
}
