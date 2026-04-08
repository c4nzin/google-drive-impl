import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
  quiet: true,
});

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.string().default("info"),
  PORT: z.string().default("3000"),
  DATABASE_URI: z.string().nonempty("DATABASE_URI is required"),
});

export const env = EnvSchema.parse(process.env);
