import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppApiServerModule } from "./api-server.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import "dotenv/config";

async function bootstrap() {
  console.log("App Name:", process.env.APP_NAME);
  const app =
    await NestFactory.create<NestExpressApplication>(AppApiServerModule);

  console.log("App Name:", process.env.APP_NAME);
  app.set("trust proxy", true);

  const appName = process.env.APP_NAME || "unknown-app";
  const swaggerPath = "skalebot-api-docs";
  const server = "/";

  const config = new DocumentBuilder()
    .setTitle(`Skalebot API for ${appName}`)
    .setDescription(`Skalebot ${appName} API description`)
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "apiKey",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "access-token",
    )
    .addServer(server, "Default server")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);

  if (process.env.DEBUG == "true") {
    const { default: open } = await import("open");
    const url = `http://localhost:${process.env.PORT}/${swaggerPath}`;
    await open(url);
  }
}

bootstrap().then(
  () => {
    console.log(`API server is running on port ${process.env.PORT ?? 3000}`);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
