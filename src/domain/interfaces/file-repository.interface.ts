import { File } from "../../domain/entities/file";

export interface IFileRepository {
  save(file: File): Promise<File>;
  findById(id: string): Promise<File | null>;
  findByOwner(ownerId: string): Promise<File[]>;
  update(id: string, data: Partial<File>): Promise<File | null>;
  delete(id: string): Promise<void>;
}
