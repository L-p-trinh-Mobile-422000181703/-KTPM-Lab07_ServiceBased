import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";

type ContextStore = {
  correlationId: string;
};

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<ContextStore>();

  run(correlationId: string, callback: () => void): void {
    this.storage.run({ correlationId }, callback);
  }

  getCorrelationId(): string | null {
    return this.storage.getStore()?.correlationId ?? null;
  }
}
