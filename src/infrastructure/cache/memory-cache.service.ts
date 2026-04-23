import { ICacheService } from "../../domain/interfaces";

export class MemoryCacheService implements ICacheService {
  private store = new Map<string, { value: any; expiresAt?: number }>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);

    if (!entry) return undefined;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
