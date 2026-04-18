import mongoose from "mongoose";
import { env } from "../config/env";

const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMongo(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.DATABASE_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      await mongoose.disconnect();
      console.log("mongo is ready");
      return;
    } catch (error) {
      console.log(
        `mongo not ready yet... (${attempt}/${MAX_ATTEMPTS}):`,
        error instanceof Error ? error.message : error,
      );
      if (attempt === MAX_ATTEMPTS) {
        console.error("mongo readiness check failed");
        process.exit(1);
      }
      await sleep(RETRY_DELAY_MS);
    }
  }
}

waitForMongo();
