import { Knex } from "knex";
import {
  IOutboxRepository,
  OutboxEvent,
} from "../../../domain/interfaces/outbox-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";

export class PostgresOutboxRepository implements IOutboxRepository {
  private db: Knex;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.db = databaseAdapter.getNativeClient();
  }

  async create(event: OutboxEvent, options?: { session?: any }): Promise<void> {
    const row = {
      ...event,
      attempts: event.attempts ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      lastError: null,
    };

    const query = this.db("outbox_events").insert(row);
    if (options?.session) {
      query.transacting(options.session);
    }

    await query;
  }

  async findPending(limit = 20): Promise<OutboxEvent[]> {
    return this.db<OutboxEvent>("outbox_events")
      .where({ status: "pending" })
      .orderBy("createdAt", "asc")
      .limit(limit)
      .select("*");
  }

  async markPublished(eventId: string): Promise<void> {
    await this.db("outbox_events")
      .where({ eventId })
      .update({
        status: "published",
        publishedAt: new Date(),
        lastError: null,
        attempts: this.db.raw("COALESCE(attempts, 0) + 1"),
        updatedAt: new Date(),
      });
  }

  async markFailed(eventId: string, error?: string): Promise<void> {
    const current = await this.db<OutboxEvent>("outbox_events")
      .where({ eventId })
      .first();

    if (!current) return;

    const attempts = (current.attempts ?? 0) + 1;
    const status = attempts >= 5 ? "failed" : "pending";

    await this.db("outbox_events")
      .where({ eventId })
      .update({
        attempts,
        lastError: error ?? null,
        status,
        updatedAt: new Date(),
      });
  }
}
