import { ICacheService } from "../../domain/interfaces";

export type CacheConstructor = new (...args: any[]) => ICacheService;
