import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { HttpModule } from "@nestjs/axios";
import { JsonLoggerService } from "../common/logger/json-logger.service";
import { RequestContextService } from "../common/context/request-context.service";

@Module({
  imports: [HttpModule],
  controllers: [OrderController],
  providers: [OrderService, JsonLoggerService, RequestContextService],
})
export class OrderModule {}
