import { Body, Controller, Get, Post, Param, Put } from "@nestjs/common";
import { CreateOrderDto } from "./dto/order.dto";
import { OrderService } from "./order.service";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrders() {
    return this.orderService.getOrders();
  }
  
  @Get(":id")
  getOrderById(@Param("id") id: number) {
    return this.orderService.getOrderById(id);
  }

  @Post()
  createOrder(@Body() payload: CreateOrderDto) {
    return this.orderService.createOrder(payload);
  }

  @Put("status/:id")
  updateOrderStatus(@Param("id") id: number, @Body("status") status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }
}
