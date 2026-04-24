import { env } from "../../../config/env";
import {
  IOutboxRepository,
  OutboxEvent,
} from "../../../domain/interfaces/outbox-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";
import { MongoOutboxRepository } from "./mongo-outbox.repository";
import { PostgresOutboxRepository } from "./postgres-outbox.repository";

export class OutboxRepository implements IOutboxRepository {
  private repository: IOutboxRepository;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.repository =
      env.DB_PROVIDER === "postgres"
        ? new PostgresOutboxRepository(databaseAdapter)
        : new MongoOutboxRepository();
  }

  create(event: OutboxEvent, options?: { session?: any }): Promise<void> {
    return this.repository.create(event, options);
  }

  findPending(limit?: number): Promise<OutboxEvent[]> {
    return this.repository.findPending(limit);
  }

  markPublished(eventId: string): Promise<void> {
    return this.repository.markPublished(eventId);
  }

  markFailed(eventId: string, error?: string): Promise<void> {
    return this.repository.markFailed(eventId, error);
  }
}
