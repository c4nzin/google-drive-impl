import "reflect-metadata";
import { connectDatabase } from "../config/database";
import { KafkaConsumer } from "../infrastructure/messaging/kafka.consumer";
import { KafkaProducer } from "../infrastructure/messaging/kafka.producer";
import Logger from "../infrastructure/logger";
import { env } from "../config/env";
import container from "../config/container";
import { handleUserCreated } from "../application/handlers/user-created.handler";
import { EmailService } from "../application/services/email.service";

async function start() {
  await connectDatabase();

  const emailService = container.resolve<EmailService>("emailService");
  const consumer = new KafkaConsumer(env.KAFKA_CONSUMER_GROUP_ID);
  const producer = new KafkaProducer();

  const userCreatedTopic = env.KAFKA_USER_CREATED_TOPIC || "user.created";
  const dlqTopic = env.KAFKA_DLQ_TOPIC || "user.created.dlq";

  await producer.connect();
  await consumer.connect();
  Logger.info("Kafka consumer connected");

  await consumer.subscribe(userCreatedTopic, true);

  await consumer.run(async (message) => {
    const event = consumer.deserialize(message);
    if (!event) return;

    if (event.type === "user.created") {
      try {
        await handleUserCreated(event, emailService);
      } catch (err: any) {
        const dlqPayload = {
          originalEvent: event,
          error: err?.message || String(err),
          failedAt: new Date().toISOString(),
        };

        try {
          await producer.publish(
            dlqTopic,
            message.key?.toString() ?? null,
            producer.serialize(dlqPayload),
          );
          Logger.warn(
            { eventId: event.eventId, dlqTopic },
            "Published failed event to DLQ",
          );
        } catch (publishErr: any) {
          Logger.error(
            {
              error: publishErr?.message || String(publishErr),
              dlqTopic,
            },
            "Failed to publish event to DLQ",
          );
        }
      }
    } else {
      Logger.warn(`Unhandled event type: ${event.type}`);
    }
  });

  process.on("SIGINT", async () => {
    Logger.info("Kafka consumer shutting down");
    await consumer.disconnect();
    await producer.disconnect();
    process.exit(0);
  });
}

start().catch((error) => {
  Logger.error(`Failed to start kafka consumer: ${error.message}`);
  process.exit(1);
});
