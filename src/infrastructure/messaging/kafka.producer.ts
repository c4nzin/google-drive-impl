import { Kafka, CompressionTypes } from "kafkajs";
import avro from "avsc";
import { readFileSync } from "node:fs";
import { IEventProducer } from "../../domain/interfaces/event-producer.interface";
import { env } from "../../config/env";

export class KafkaProducer implements IEventProducer {
  private kafka: Kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(",").map((b) => b.trim()),
    retry: {
      retries: 10,
      initialRetryTime: 300,
    },
    connectionTimeout: 3000,
    requestTimeout: 30000,
  });

  private avroType?: avro.Type;

  private producer = this.kafka.producer();

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(topic: string, key: string | null, messageBuffer: Buffer) {
    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: key ?? undefined,
          value: messageBuffer,
        },
      ],
      timeout: 30000,
    });
  }

  serialize(obj: any): Buffer {
    if (Buffer.isBuffer(obj)) return obj;
    if (this.avroType) return this.avroType.toBuffer(obj);

    return Buffer.from(JSON.stringify(obj));
  }
}
