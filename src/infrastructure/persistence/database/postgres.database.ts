import knex, { Knex } from "knex";
import { env } from "../../../config/env";
import { IDatabaseAdapter, IDatabaseSession } from "../../../domain/interfaces";

class PostgresSession implements IDatabaseSession {
  constructor(private trx: Knex.Transaction) {}

  async endSession(): Promise<void> {
    return Promise.resolve();
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    try {
      const result = await fn();
      await this.trx.commit();
      return result;
    } catch (error) {
      await this.trx.rollback();
      throw error;
    }
  }

  getNativeSession() {
    return this.trx;
  }
}

export class PostgresDatabaseAdapter implements IDatabaseAdapter {
  private client?: Knex;

  async connect(): Promise<void> {
    if (this.client) return;

    this.client = knex({
      client: "pg",
      connection: env.DATABASE_URI,
      pool: { min: 2, max: 10 },
    });

    await this.createSchema();
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.destroy();
    this.client = undefined;
  }

  async startSession(): Promise<IDatabaseSession> {
    if (!this.client) {
      throw new Error("Postgres client is not connected");
    }

    const trx = await this.client.transaction();
    return new PostgresSession(trx);
  }

  isConnected(): boolean {
    return !!this.client;
  }

  getNativeClient(): any {
    if (!this.client) {
      throw new Error("Postgres client is not connected");
    }
    return this.client;
  }

  private async createSchema(): Promise<void> {
    if (!this.client) return;

    if (!(await this.client.schema.hasTable("users"))) {
      await this.client.schema.createTable("users", (table) => {
        table.string("id").primary();
        table.string("username").notNullable().unique();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.string("firstName");
        table.string("lastName");
        table.string("refreshToken");
        table.timestamp("createdAt").defaultTo(this.client!.fn.now());
        table.timestamp("updatedAt").defaultTo(this.client!.fn.now());
      });
    }

    if (!(await this.client.schema.hasTable("files"))) {
      await this.client.schema.createTable("files", (table) => {
        table.string("id").primary();
        table.string("ownerId").notNullable().index();
        table.string("parentId").index();
        table.string("name").notNullable();
        table.string("mimeType").notNullable();
        table.integer("size").notNullable();
        table.string("storageKey").notNullable();
        table.boolean("isFolder").defaultTo(false);
        table.jsonb("sharedWith").defaultTo(JSON.stringify([]));
        table.boolean("isDeleted").defaultTo(false);
        table.timestamp("createdAt").defaultTo(this.client!.fn.now());
        table.timestamp("updatedAt").defaultTo(this.client!.fn.now());
      });
    }

    if (!(await this.client.schema.hasTable("outbox_events"))) {
      await this.client.schema.createTable("outbox_events", (table) => {
        table.string("eventId").primary();
        table.string("topic").notNullable();
        table.string("key").notNullable();
        table.jsonb("payload").notNullable();
        table.string("status").notNullable();
        table.integer("attempts").defaultTo(0);
        table.timestamp("publishedAt").nullable();
        table.text("lastError").nullable();
        table.timestamp("createdAt").defaultTo(this.client!.fn.now());
        table.timestamp("updatedAt").defaultTo(this.client!.fn.now());
      });
    }
  }
}
