jest.mock("@repo/queue", () => ({
  RabbitPublisher: jest.fn().mockImplementation(() => {
    return { publishOtp: jest.fn() };
  }),
}));

jest.mock("@repo/db", () => {
  return {
    Session: class Session {},
    User: class User {},
    Providers: { GITHUB: "GITHUB", EMAIL: "EMAIL", GOOGLE: "GOOGLE" },
    SocialAccountProvider: {
      INSTAGRAM: "INSTAGRAM",
      WHATSAPP: "WHATSAPP",
      TELEGRAM: "TELEGRAM",
    },
    SocialAccountStatus: {
      ACTIVE: "ACTIVE",
      EXPIRED: "EXPIRED",
      REVOKED: "REVOKED",
      DISCONNECTED: "DISCONNECTED",
    },
    prisma: {},
  };
});
