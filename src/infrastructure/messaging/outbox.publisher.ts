import { KafkaProducer } from "./kafka.producer";
import { OutboxModel } from "../persistence/schemas/outbox.schema";

export async function publishPendingOutboxEvents(producer: KafkaProducer) {
  const events = await OutboxModel.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(20)
    .exec();

  for (const event of events) {
    try {
      const payload = producer.serialize(event.payload);
      await producer.publish(event.topic, event.key ?? null, payload);

      event.status = "published";
      event.publishedAt = new Date();
      event.attempts += 1;
      event.lastError = null;
      await event.save();
    } catch (err: any) {
      event.attempts += 1;
      event.lastError = err.message;
      if (event.attempts >= 5) {
        event.status = "failed";
      }
      await event.save();
    }
  }
}
