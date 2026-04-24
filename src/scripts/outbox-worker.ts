import "reflect-metadata";
import { KafkaProducer } from "../infrastructure/messaging/kafka.producer";
import Logger from "../infrastructure/logger";
import container from "../config/container";
import { publishPendingOutboxEvents } from "../infrastructure/messaging/outbox.publisher";
import { IDatabaseAdapter, IOutboxRepository } from "../domain/interfaces";

const WORKER_INTERVAL_MS = 5000;

async function startWorker() {
  const databaseAdapter =
    container.resolve<IDatabaseAdapter>("databaseAdapter");
  await databaseAdapter.connect();

  const outboxRepository =
    container.resolve<IOutboxRepository>("outboxRepository");
  const producer = new KafkaProducer();

  await producer.connect();

  Logger.info("Outbox worker started and connected to Kafka");

  while (true) {
    try {
      await publishPendingOutboxEvents(producer, outboxRepository);
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
