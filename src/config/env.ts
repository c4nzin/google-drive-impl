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
  JWT_SECRET: z.string().nonempty("JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

export const env = EnvSchema.parse(process.env);
