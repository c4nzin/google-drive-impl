import "reflect-metadata";
import { connectDatabase } from "../config/database";
import { KafkaConsumer } from "../infrastructure/messaging/kafka.consumer";
import Logger from "../infrastructure/logger";
import { env } from "../config/env";
import { handleUserCreated } from "../application/handlers/user-created.handler";

async function start() {
  await connectDatabase();

  const consumer = new KafkaConsumer(env.KAFKA_CONSUMER_GROUP_ID);
  await consumer.connect();
  Logger.info("Kafka consumer connected");

  await consumer.subscribe(
    env.KAFKA_USER_CREATED_TOPIC || "user.created",
    true,
  );

  await consumer.run(async (message) => {
    const event = consumer.deserialize(message);
    if (!event) return;

    if (event.type === "user.created") {
      await handleUserCreated(event);
    } else {
      Logger.warn(`Unhandled event type: ${event.type}`);
    }
  });

  process.on("SIGINT", async () => {
    Logger.info("Kafka consumer shutting down");
    await consumer.disconnect();
    process.exit(0);
  });
}

start().catch((error) => {
  Logger.error(`Failed to start kafka consumer: ${error.message}`);
  process.exit(1);
});
