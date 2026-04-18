export interface IEventProducer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(
    topic: string,
    key: string | null,
    messageBuffer: Buffer,
  ): Promise<void>;
}
