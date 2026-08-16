import { SocialAccountProvider } from "@repo/db";

export interface RenewedCredentials {
  tokenExpiresAt: Date;
}

/**
 * Shared contract for provider-specific implementations.
 *
 * Each external platform (Instagram, WhatsApp, Telegram) must provide its own
 * implementation so provider logic stays isolated from the core module.
 */
export abstract class SocialAccountProviderService {
  public abstract readonly provider: SocialAccountProvider;

  /**
   * Duration in milliseconds a renewed access token stays valid before expiry.
   * Provider-specific token lifetimes differ per platform.
   */
  public abstract getRenewedTokenLifetime(): number;

  public renewAccessToken(): RenewedCredentials {
    const tokenLifetime = this.getRenewedTokenLifetime();
    return {
      tokenExpiresAt: new Date(Date.now() + tokenLifetime),
    };
  }
}
