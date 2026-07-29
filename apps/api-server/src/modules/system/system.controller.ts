import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SystemService } from "./system.service";

@ApiTags("System")
@Controller("system")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("health")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Overall application health" })
  @ApiResponse({ status: 200, description: "Application health" })
  public health() {
    return this.systemService.getHealth();
  }
}
