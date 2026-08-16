import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { SystemService } from "./system.service";

@ApiTags("System")
@Controller("system")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("health")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Overall application health",
    description:
      "Returns the liveness/health status of the API along with uptime and the state of its core dependencies.",
  })
  @ApiOkResponse({
    description:
      "Health check payload with API status, uptime, and dependency checks.",
  })
  public health() {
    return this.systemService.getHealth();
  }
}
