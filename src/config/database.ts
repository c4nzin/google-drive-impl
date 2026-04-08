import mongoose from "mongoose";
import { env } from "./env";
import { DatabaseConnectionError } from "../domain/errors/app-error";

let isConnected: boolean = false;
//add pino logger here!!!
export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    if (isConnected) {
      return mongoose;
    }

    await mongoose.connect(env.DATABASE_URI);

    isConnected = true;

    return mongoose;
  } catch (error) {
    console.log("Database connection error:", error);
    throw new DatabaseConnectionError("Failed to connect to the database");
  }
}

export function getDatabase() {
  if (!isConnected) throw new DatabaseConnectionError("Database not connected");

  return mongoose;
}

mongoose.connection.on("disconnected", () => {
  console.log("Database disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("Database connection error:", err);
});
