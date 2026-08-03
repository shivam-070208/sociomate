import { Global, Module } from "@nestjs/common";
import { RabbitService } from "./rabbit.service.ts";
import { RabbitPublisher } from "./rabbit.publisher.ts";

@Global()
@Module({
  providers: [RabbitService, RabbitPublisher],
  exports: [RabbitService, RabbitPublisher],
})
export class RabbitModule {}
