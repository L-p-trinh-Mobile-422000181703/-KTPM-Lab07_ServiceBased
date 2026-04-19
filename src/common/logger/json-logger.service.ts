import { Injectable, LoggerService } from "@nestjs/common";
import { RequestContextService } from "../context/request-context.service";

type AppLogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "VERBOSE";

@Injectable()
export class JsonLoggerService implements LoggerService {
  constructor(private readonly requestContext: RequestContextService) {}

  log(message: unknown, context?: string): void {
    this.write("INFO", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("ERROR", message, context, undefined, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write("WARN", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("DEBUG", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("VERBOSE", message, context);
  }

  logEvent(
    level: AppLogLevel,
    message: string,
    metadata: Record<string, unknown> = {},
    context?: string,
  ): void {
    this.write(level, message, context, metadata);
  }

  private write(
    level: AppLogLevel,
    message: unknown,
    context = "Application",
    metadata: Record<string, unknown> = {},
    trace?: string,
  ): void {
    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      context,
      correlationId: this.requestContext.getCorrelationId(),
      message,
      ...metadata,
    };

    if (trace) {
      payload.trace = trace;
    }

    const line = `${JSON.stringify(payload)}\n`;

    if (level === "ERROR") {
      process.stderr.write(line);
      return;
    }

    process.stdout.write(line);
  }
}
