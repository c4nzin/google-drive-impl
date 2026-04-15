import {
  IFileRepository,
  ListFilesOptions,
  ListFilesResult,
} from "../../../domain/interfaces/file-repository.interface";
import { File } from "../../../domain/entities/file";
import { FileModel } from "../schemas/file.schema";

export class FileRepository implements IFileRepository {
  constructor() {}

  async findByIdOwnerWithFilter(
    ownerId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult> {
    const query: any = { ownerId, isDeleted: false };

    if (options?.parentId) {
      query.parentId = options.parentId;
    }

    if (options?.search) {
      query.name = { $regex: options.search, $options: "i" };
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 20);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      FileModel.find(query).skip(skip).limit(limit).exec(),
      FileModel.countDocuments(query).exec(),
    ]);

    return { files, total, page, limit };
  }
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
