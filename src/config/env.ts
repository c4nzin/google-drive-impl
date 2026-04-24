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
  JWT_REFRESH_SECRET: z.string().nonempty("JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  STORAGE_ROOT: z.string().default("./storage"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET_NAME: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  MEMCACHED_URI: z.string().optional(),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().optional(),
  KAFKA_USER_CREATED_TOPIC: z.string().optional(),
  KAFKA_GROUP_ID: z.string().optional(),
  KAFKA_DLQ_TOPIC: z.string().optional(),
  KAFKA_CONSUMER_GROUP_ID: z.string().default("googledrive-consumer-group"),
  SMTP_HOST: z.string().nonempty("SMTP_HOST is required"),
  SMTP_PORT: z.string().nonempty("SMTP_PORT is required"),
  SMTP_USER: z.string().nonempty("SMTP_USER is required"),
  SMTP_PASSWORD: z.string().nonempty("SMTP_PASSWORD is required"),
  KAFKA_FILE_UPLOADED_TOPIC: z.string().default("file.uploaded"),
  REDIS_URL: z.string().nonempty("REDIS_URL is required"),
  REDIS_MAX_RETRIES: z.number().default(5),
  REDIS_RETRY_DELAY: z.number().default(2000),
  CACHE_PROVIDER: z.enum(["keyv", "redis", "memory"]).default("keyv"),
  DB_PROVIDER: z.enum(["mongo", "postgres"]).default("mongo"),
});

export const env = EnvSchema.parse(process.env);
