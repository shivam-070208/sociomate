import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./api-server.service";

@Controller()
@ApiTags("Root")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "API root",
    description: "Returns a basic greeting to confirm the API is reachable.",
  })
  @ApiOkResponse({ description: "Greeting message from the API." })
  public getHello(): string {
    return this.appService.getHello();
  }
}
