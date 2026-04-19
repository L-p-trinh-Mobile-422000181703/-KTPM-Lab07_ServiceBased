import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, tap, throwError } from "rxjs";
import { Request, Response } from "express";
import { JsonLoggerService } from "../logger/json-logger.service";
import { RequestContextService } from "../context/request-context.service";

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: JsonLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();
    const startedAt = Date.now();

    this.logger.logEvent(
      "INFO",
      "Incoming request",
      {
        event: "http.request.start",
        method: req.method,
        path: req.originalUrl ?? req.url,
        correlationId: this.requestContext.getCorrelationId(),
      },
      HttpLoggingInterceptor.name,
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.logEvent(
          "INFO",
          "Request completed",
          {
            event: "http.request.end",
            method: req.method,
            path: req.originalUrl ?? req.url,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            correlationId: this.requestContext.getCorrelationId(),
          },
          HttpLoggingInterceptor.name,
        );
      }),
      catchError((error: unknown) => {
        this.logger.logEvent(
          "ERROR",
          "Request failed",
          {
            event: "http.request.error",
            method: req.method,
            path: req.originalUrl ?? req.url,
            statusCode: this.extractStatusCode(error),
            durationMs: Date.now() - startedAt,
            correlationId: this.requestContext.getCorrelationId(),
            errorMessage: this.extractErrorMessage(error),
          },
          HttpLoggingInterceptor.name,
        );

        return throwError(() => error);
      }),
    );
  }

  private extractStatusCode(error: unknown): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    return 500;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}
