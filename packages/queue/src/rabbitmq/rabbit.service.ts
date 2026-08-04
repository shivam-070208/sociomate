import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import amqplib, { Channel, Options, ChannelModel } from "amqplib";
import {
  EXCHANGE_DURABLE,
  EXCHANGE_NAME,
  EXCHANGE_TYPE,
} from "../constants/exchanges.ts";
import { QUEUE_DURABLE, QUEUE_NAME } from "../constants/queues.ts";
import { OTP_ROUTING_KEY } from "../constants/routing-keys.ts";

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  public async onModuleInit() {
    console.log(process.env.RABBITMQ_URL);
    this.connection = await amqplib.connect(
      process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
    );
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE as any, {
      durable: EXCHANGE_DURABLE,
    });
    await this.channel.assertQueue(QUEUE_NAME, { durable: QUEUE_DURABLE });
    await this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, OTP_ROUTING_KEY);
    this.logger.log(
      `Connected RabbitMQ exchange=${EXCHANGE_NAME} queue=${QUEUE_NAME}`,
    );
  }

  public async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  public getChannel() {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialized");
    }
    return this.channel;
  }

  public async publish<T>(
    routingKey: string,
    payload: T,
    options?: Options.Publish,
  ) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialized");
    }
    const buffer = Buffer.from(JSON.stringify(payload), "utf-8");
    const result = this.channel.publish(EXCHANGE_NAME, routingKey, buffer, {
      persistent: true,
      contentType: "application/json",
      ...(options ?? {}),
    });

    this.logger.log(
      `Published RabbitMQ message to exchange=${EXCHANGE_NAME} routingKey=${routingKey} success=${result}`,
    );

    return result;
  }
}
