import { SystemService } from "@/modules/system/system.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("SystemService", () => {
  let service: SystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemService],
    }).compile();
    service = module.get<SystemService>(SystemService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return health status", () => {
    const result = service.getHealth();
    expect(result.success).toBe(true);
    expect(result.status).toBe("ok");
    expect(typeof result.uptime).toBe("number");
    expect(typeof result.appName).toBe("string");
    expect(typeof result.appVersion).toBe("string");
    expect(result.checks).toEqual({
      api: "ok",
      database: "unknown",
      rabbitmq: "unknown",
      storage: "unknown",
    });
  });
});
