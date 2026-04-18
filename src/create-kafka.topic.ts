import { Kafka } from "kafkajs";
import { env } from "./config/env";

const MAX_KAFKA_ADMIN_ATTEMPTS = 10;
const KAFKA_ADMIN_RETRY_DELAY_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createKafkaTopic() {
  const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(",").map((b) => b.trim()),
  });

  const admin = kafka.admin();

  for (let attempt = 1; attempt <= MAX_KAFKA_ADMIN_ATTEMPTS; attempt += 1) {
    try {
      await admin.connect();
      await admin.createTopics({
        topics: [
          {
            topic: env.KAFKA_USER_CREATED_TOPIC || "user.created",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
        waitForLeaders: true,
      });
      await admin.disconnect();
      return;
    } catch (error) {
      await admin.disconnect().catch(() => undefined);
      if (attempt === MAX_KAFKA_ADMIN_ATTEMPTS) {
        throw error;
      }
      await sleep(KAFKA_ADMIN_RETRY_DELAY_MS);
    }
  }
}
