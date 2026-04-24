import { env } from "../../../config/env";
import { File } from "../../../domain/entities/file";
import {
  IFileRepository,
  ListFilesOptions,
  ListFilesResult,
} from "../../../domain/interfaces/file-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";
import { MongoFileRepository } from "./mongo-file.repository";
import { PostgresFileRepository } from "./postgres-file.repository";

export class FileRepository implements IFileRepository {
  private repository: IFileRepository;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.repository =
      env.DB_PROVIDER === "postgres"
        ? new PostgresFileRepository(databaseAdapter)
        : new MongoFileRepository();
  }

  save(file: File): Promise<File> {
    return this.repository.save(file);
  }

  findById(id: string): Promise<File | null> {
    return this.repository.findById(id);
  }

  findByOwner(ownerId: string): Promise<File[]> {
    return this.repository.findByOwner(ownerId);
  }

  update(id: string, data: Partial<File>): Promise<File | null> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  findByIdOwnerWithFilter(
    ownerId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult> {
    return this.repository.findByIdOwnerWithFilter(ownerId, options);
  }

  findByUserWithFilter(
    userId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult> {
    return this.repository.findByUserWithFilter(userId, options);
  }
}
