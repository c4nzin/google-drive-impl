import { env } from "../../config/env";
import { ICacheService } from "../../domain/interfaces";
import { createClient } from "redis";
import Logger from "../logger";

export class RedisCacheService implements ICacheService {
  private client = createClient({ url: env.REDIS_URL });

  constructor() {
    this.client.connect().catch((err) => {
      Logger.error({ error: err }, "failed to connect to Redis");
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const json = await this.client.get(key);

    return json ? (JSON.parse(json) as T) : undefined;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);

    if (ttl) {
      await this.client.set(key, data, { EX: ttl });
    } else {
      await this.client.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
