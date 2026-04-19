import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RequestContextService } from "./common/context/request-context.service";
import { HttpLoggingInterceptor } from "./common/interceptors/http-logging.interceptor";
import { JsonLoggerService } from "./common/logger/json-logger.service";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { PrismaModule } from "./prisma/prisma.module";
import { OrderModule } from "./order/order.module";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    PrismaModule,
    OrderModule,
  ],
  providers: [
    RequestContextService,
    JsonLoggerService,
    CorrelationIdMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
  exports: [JsonLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
