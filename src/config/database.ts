import mongoose from "mongoose";
import { env } from "./env";
import { DatabaseConnectionError } from "../domain/errors/app-error";

const MAX_DATABASE_CONNECT_ATTEMPTS = 12;
const DATABASE_CONNECT_RETRY_DELAY_MS = 5000;

let isConnected: boolean = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt < MAX_DATABASE_CONNECT_ATTEMPTS) {
    attempt += 1;

    try {
      await mongoose.connect(env.DATABASE_URI, {
        autoIndex: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      return mongoose;
    } catch (error) {
      lastError = error;

      console.warn(
        `Database connection attempt ${attempt} failed. Retrying in ${DATABASE_CONNECT_RETRY_DELAY_MS}ms...`,
        error instanceof Error ? error.message : error,
      );

      if (attempt >= MAX_DATABASE_CONNECT_ATTEMPTS) {
        console.error("Final database connection failure:", error);
        break;
      }

      await sleep(DATABASE_CONNECT_RETRY_DELAY_MS);
    }
  }

  throw new DatabaseConnectionError("Failed to connect to the database");
}

export function getDatabase() {
  if (!isConnected) throw new DatabaseConnectionError("Database not connected");

  return mongoose;
}

mongoose.connection.on("disconnected", () => {
  console.warn("Database disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("Database connection error:", err);
});
