import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { RequestContextService } from "../context/request-context.service";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const headerValue = req.header("x-correlation-id");
    const correlationId =
      headerValue && headerValue.trim().length > 0 ? headerValue : randomUUID();

    res.setHeader("x-correlation-id", correlationId);
    this.requestContext.run(correlationId, next);
  }
}
