import { File } from "../../domain/entities/file";

export interface ListFilesOptions {
  parentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListFilesResult {
  files: File[];
  total: number;
  page: number;
  limit: number;
}

export interface IFileRepository {
  save(file: File): Promise<File>;
  findById(id: string): Promise<File | null>;
  findByOwner(ownerId: string): Promise<File[]>;
  update(id: string, data: Partial<File>): Promise<File | null>;
  delete(id: string): Promise<void>;
  findByIdOwnerWithFilter(
    ownerId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult>;
}
