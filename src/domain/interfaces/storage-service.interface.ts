import { Readable } from "node:stream";

export interface IStorageService {
  saveFile(sourcePath: string, desinationKey: string): Promise<string>;
  getFileStream(key: string): Promise<Readable>;
  deleteFile(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
