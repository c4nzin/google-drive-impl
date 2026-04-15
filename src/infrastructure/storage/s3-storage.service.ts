import { Readable } from "node:stream";
import { IStorageService } from "../../domain/interfaces";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3,
  S3Client,
} from "@aws-sdk/client-s3";
import fsPromises from "node:fs/promises";
import { env } from "../../config/env";
import { NotFoundError } from "../../domain/errors/app-error";
import { createReadStream } from "node:fs";

export class S3StorageService implements IStorageService {
  private client = new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId:
        env.S3_ACCESS_KEY_ID ||
        (() => {
          throw new NotFoundError("S3_ACCESS_KEY_ID is not defined");
        })(),
      secretAccessKey:
        env.S3_SECRET_ACCESS_KEY ||
        (() => {
          throw new NotFoundError("S3_SECRET_ACCESS_KEY is not defined");
        })(),
    },
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
  });

  async saveFile(sourcePath: string, desinationKey: string): Promise<string> {
    const stream = createReadStream(sourcePath);

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: desinationKey,
        Body: stream,
      }),
    );

    await fsPromises.unlink(sourcePath);

    return desinationKey;
  }

  async getFileStream(key: string): Promise<Readable> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new NotFoundError(`File with key ${key} not found in S3`);
    }

    return response.Body as Readable;
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
