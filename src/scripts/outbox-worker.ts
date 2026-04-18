import "reflect-metadata";
import { connectDatabase } from "../config/database";
import { KafkaProducer } from "../infrastructure/messaging/kafka.producer";
import Logger from "../infrastructure/logger";
import { publishPendingOutboxEvents } from "../infrastructure/messaging/outbox.publisher";

const WORKER_INTERVAL_MS = 5000;

async function startWorker() {
  await connectDatabase();

  const producer = new KafkaProducer();

  await producer.connect();

  Logger.info("Outbox worker started and connected to Kafka");

  while (true) {
    try {
      await publishPendingOutboxEvents(producer);
    } catch (error: any) {
      Logger.error(`Error in outbox worker: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, WORKER_INTERVAL_MS));
  }
}

startWorker().catch((error) => {
  Logger.error(`Failed to start outbox worker: ${error.message}`);
  process.exit(1);
});

process.on("SIGINT", async () => {
  Logger.info("Outbox worker shutting down...");
  process.exit(0);
});
