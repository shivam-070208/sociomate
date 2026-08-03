import { Injectable, Logger } from "@nestjs/common";
import type { ConsumeMessage } from "amqplib";
import { RabbitService } from "./rabbit.service.ts";

@Injectable()
export class RabbitConsumer {
  private readonly logger = new Logger(RabbitConsumer.name);

  constructor(private readonly rabbitService: RabbitService) {}

  public async consume(queue: string, onMessage: (content: unknown) => void) {
    const channel = this.rabbitService.getChannel();
    await channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }
      try {
        const payload = JSON.parse(msg.content.toString("utf-8"));
        onMessage(payload);
        channel.ack(msg);
      } catch (error) {
        this.logger.error("Failed to process message", error as Error);
        channel.nack(msg, false, false);
      }
    });
  }
}
