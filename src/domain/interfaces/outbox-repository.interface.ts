export interface OutboxEvent {
  eventId: string;
  topic: string;
  key: string;
  payload: any;
  status: string;
  attempts?: number;
  publishedAt?: Date | null;
  lastError?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOutboxRepository {
  create(event: OutboxEvent, options?: { session?: any }): Promise<void>;
  findPending(limit?: number): Promise<OutboxEvent[]>;
  markPublished(eventId: string): Promise<void>;
  markFailed(eventId: string, error?: string): Promise<void>;
}

export interface IOutboxRepository {
  create(event: OutboxEvent, options?: { session?: any }): Promise<void>;
  markPublished(eventId: string): Promise<void>;
}
