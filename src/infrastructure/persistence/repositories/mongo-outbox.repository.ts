import {
  IOutboxRepository,
  OutboxEvent,
} from "../../../domain/interfaces/outbox-repository.interface";
import { OutboxModel } from "../schemas/outbox.schema";

export class MongoOutboxRepository implements IOutboxRepository {
  async create(event: OutboxEvent, options?: { session?: any }): Promise<void> {
    await OutboxModel.create([event], { session: options?.session });
  }

  async findPending(limit = 20): Promise<OutboxEvent[]> {
    const events = await OutboxModel.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();

    return events.map((event) => ({
      eventId: event.eventId,
      topic: event.topic,
      key: event.key as string,
      payload: event.payload,
      status: event.status,
      attempts: event.attempts,
      publishedAt: event.publishedAt,
      lastError: event.lastError,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
  }

  async markPublished(eventId: string): Promise<void> {
    await OutboxModel.findOneAndUpdate(
      { eventId },
      {
        status: "published",
        publishedAt: new Date(),
        lastError: null,
        $inc: { attempts: 1 },
      },
      { new: true },
    ).exec();
  }

  async markFailed(eventId: string, error?: string): Promise<void> {
    const event = await OutboxModel.findOne({ eventId }).exec();

    if (!event) {
      return;
    }

    event.attempts = (event.attempts ?? 0) + 1;
    event.lastError = error ?? null;
    event.status = event.attempts >= 5 ? "failed" : "pending";
    await event.save();
  }
}
