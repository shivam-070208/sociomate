import { SystemController } from "@/modules/system/system.controller";
import { SystemService } from "@/modules/system/system.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("SystemController", () => {
  let controller: SystemController;

  const mockSystemService = {
    getHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        {
          provide: SystemService,
          useValue: mockSystemService,
        },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getHealth", () => {
    it("should call SystemService.getHealth and return its value", () => {
      const mockHealth = { status: "ok" };
      mockSystemService.getHealth.mockReturnValue(mockHealth);

      const result = controller.health();
      expect(mockSystemService.getHealth).toHaveBeenCalled();
      expect(result).toEqual(mockHealth);
    });
  });
});
