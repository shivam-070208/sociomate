import { Injectable } from "@nestjs/common";

@Injectable()
export class SystemService {
  constructor() {}

  public getHealth() {
    return {
      success: true,
      status: "ok",
      uptime: process.uptime(),
      appName: process.env.APP_NAME || "unknown-app",
      appVersion: process.env.APP_VERSION || "unknown-version",
      checks: {
        api: "ok",
        database: "unknown",
        rabbitmq: "unknown",
        storage: "unknown",
      },
    };
  }
}
