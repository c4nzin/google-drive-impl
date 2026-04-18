import { Consumer, Kafka, KafkaMessage } from "kafkajs";
import { env } from "../../config/env";
import Logger from "../logger";

export class KafkaConsumer {
  private kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(",").map((b) => b.trim()),
    retry: {
      retries: 10,
      initialRetryTime: 300,
    },
    connectionTimeout: 3000,
    requestTimeout: 30000,
  });

  private consumer: Consumer;

  constructor(groupId: string) {
    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    await this.consumer.connect();
  }

  async disconnect() {
    await this.consumer.disconnect();
  }

  async subscribe(topic: string, fromBeginning = false) {
    await this.consumer.subscribe({ topic, fromBeginning });
  }

  async run(handler: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        try {
          await handler(message);
        } catch (error: any) {
          Logger.error(
            `Kafka consumer error topic=${topic} partition=${partition} error=${error.message}`,
          );
          throw error;
        }
      },
    });
  }

  deserialize(message: KafkaMessage) {
    if (!message.value) return null;

    const value = message.value.toString();

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
