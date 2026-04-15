import { ICacheService } from "../../domain/interfaces/cache-service.interface";
import Keyv from "keyv";
import KeyvMemcache from "@keyv/memcache";

export class KeyvCacheService implements ICacheService {
  private client = new Keyv({ store: new KeyvMemcache() });

  constructor() {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.client.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.client.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.client.delete(key);
  }
}
