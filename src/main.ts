import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { JsonLoggerService } from "./common/logger/json-logger.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(JsonLoggerService);

  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: "*",
  });

  const host = process.env.HOST ?? "172.16.43.169";
  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port, host);

  logger.logEvent(
    "INFO",
    "Order service started",
    {
      event: "service.start",
      host,
      port,
    },
    "Bootstrap",
  );
}

bootstrap();
