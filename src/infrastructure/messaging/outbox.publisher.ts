import { KafkaProducer } from "./kafka.producer";
import { IOutboxRepository } from "../../domain/interfaces";

export async function publishPendingOutboxEvents(
  producer: KafkaProducer,
  outboxRepository: IOutboxRepository,
) {
  const events = await outboxRepository.findPending(20);

  for (const event of events) {
    try {
      const payload = producer.serialize(event.payload);
      await producer.publish(event.topic, event.key ?? null, payload);

      await outboxRepository.markPublished(event.eventId);
    } catch (err: any) {
      await outboxRepository.markFailed(
        event.eventId,
        err?.message || String(err),
      );
    }
  }
}
