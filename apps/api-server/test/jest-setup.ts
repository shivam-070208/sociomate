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
    prisma: {},
  };
});
