import Queue from "bull";
import { env } from "../../config/env";
import Logger from "../logger";

export interface SendWelcomeEmailJobData {
  eventId: string;
  userId: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

export const emailQueue = new Queue<SendWelcomeEmailJobData>(
  "email_welcome",
  env.REDIS_URL,
  {
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
  },
);

emailQueue.on("error", (error: any) => {
  Logger.error(`Email Queue Error: ${error.message}`);
});
