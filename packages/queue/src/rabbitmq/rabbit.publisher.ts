import { Injectable } from "@nestjs/common";
import { RabbitService } from "./rabbit.service.ts";
import { OTP_ROUTING_KEY } from "../constants/routing-keys.ts";

export interface OtpPublishPayload {
  userId: string;
  email: string;
  otp: string;
  expiresAt: string;
}

@Injectable()
export class RabbitPublisher {
  constructor(private readonly rabbitService: RabbitService) {}

  public async publishOtp(payload: OtpPublishPayload) {
    await this.rabbitService.publish<OtpPublishPayload>(
      OTP_ROUTING_KEY,
      payload,
      {
        persistent: true,
        contentType: "application/json",
      },
    );
  }
}
