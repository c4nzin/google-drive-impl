import { IFileRepository } from "../../../domain/interfaces/file-repository.interface";
import { File } from "../../../domain/entities/file";
import { FileModel } from "../schemas/file.schema";

export class FileRepository implements IFileRepository {
  async save(file: File): Promise<File> {
    return FileModel.create(file);
  }

  async findById(id: string): Promise<File | null> {
    return FileModel.findById(id).exec();
  }

  async findByOwner(ownerId: string): Promise<File[]> {
    return FileModel.find({ ownerId, isDeleted: false }).exec();
  }

  async update(id: string, data: Partial<File>): Promise<File | null> {
    return FileModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await FileModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
  }
}
