import { Readable } from "node:stream";
import { IStorageService } from "../../domain/interfaces";
import path from "node:path";
import { env } from "../../config/env";
import fsPromises from "node:fs/promises";
import { createReadStream } from "node:fs";

export class LocalStorageService implements IStorageService {
  private root = path.resolve(env.STORAGE_ROOT);

  async saveFile(sourcePath: string, desinationKey: string): Promise<string> {
    const destination = path.join(this.root, desinationKey);
    await fsPromises.mkdir(path.dirname(destination), { recursive: true });
    await fsPromises.rename(sourcePath, destination);
    return desinationKey;
  }

  async getFileStream(key: string): Promise<Readable> {
    const filePath = path.join(this.root, key);
    return createReadStream(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.root, key);
    await fsPromises.unlink(filePath);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.root, key);

    try {
      await fsPromises.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
