import { env } from "../../config/env";
import { IQueue, JobData, ProcessHandler } from "../../domain/interfaces";
import Queue from "bull";
import Logger from "../logger";

export class BullQueue<T extends JobData = JobData> implements IQueue<T> {
  private queue = new Queue("default", env.REDIS_URL, {
    defaultJobOptions: {
      attempts: env.REDIS_MAX_RETRIES,
      backoff: {
        type: "exponential",
        delay: env.REDIS_RETRY_DELAY,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
    settings: {
      stalledInterval: 30000,
      maxStalledCount: 3,
    },
  });

  async add(name: string, data: T, opts?: Record<string, any>): Promise<void> {
    await this.queue.add(name, data, opts);
  }

  process(name: string, handler: ProcessHandler<T>): void {
    this.queue.process(name, async (job) => {
      await handler(job.data);
    });

    this.queue.on("completed", (job) => {
      Logger.info(`Job completed: ${job.id} (${job.name})`);
    });

    this.queue.on("failed", (job, err) => {
      Logger.error(`Job failed: ${job.id} (${job.name}) - ${err.message}`);
    });

    this.queue.on("error", (error: any) => {
      Logger.error(`Queue Error: ${error.message}`);
    });
  }

  waitUntilReady(): Promise<any> {
    return this.queue.isReady();
  }

  close(): Promise<void> {
    return this.queue.close();
  }
}
