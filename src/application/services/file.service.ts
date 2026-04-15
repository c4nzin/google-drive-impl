import path from "path";
import { v4 as uuidv4 } from "uuid";
import { IFileRepository } from "../../domain/interfaces/file-repository.interface";
import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import { File } from "../../domain/entities/file";
import { NotFoundError } from "../../domain/errors/app-error";
import { ICacheService } from "../../domain/interfaces";

export class FileService {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
    private cacheService: ICacheService,
  ) {}

  async uploadFile(
    ownerId: string,
    localPath: string,
    originalName: string,
    mimeType: string,
    size: number,
    parentId?: string,
  ): Promise<File> {
    const storageKey = `${ownerId}/${uuidv4()}${path.extname(originalName)}`;

    await this.storageService.saveFile(localPath, storageKey);

    const file = new File();
    file.ownerId = ownerId;
    file.parentId = parentId;
    file.name = originalName;
    file.mimeType = mimeType;
    file.size = size;
    file.storageKey = storageKey;

    const saved = await this.fileRepository.save(file);

    await this.cacheService.delete(`file-list_${ownerId}`);

    return saved;
  }

  async downloadFile(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    //await this.cacheService.set(`file_${file.id}`, file, 3600);

    return {
      file,
      stream: await this.storageService.getFileStream(file.storageKey),
    };
  }

  async listFiles(ownerId: string) {
    const cacheKey = `file-list_${ownerId}`;

    const cached = await this.cacheService.get<File[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const files = await this.fileRepository.findByOwner(ownerId);

    await this.cacheService.set(cacheKey, files, 3600);

    return files;
  }

  async deleteFile(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);

    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    await this.storageService.deleteFile(file.storageKey);
    await this.fileRepository.delete(fileId);

    await this.cacheService.delete(`file-list_${ownerId}`);
    await this.cacheService.delete(`file_${fileId}`);
  }

  async getFileById(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);

    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    return file;
  }

  async updateFile(fileId: string, ownerId: string, data: Partial<File>) {
    const file = await this.fileRepository.findById(fileId);

    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    const updatedFile = await this.fileRepository.update(fileId, data);

    await this.cacheService.delete(`file-list_${ownerId}`);
    await this.cacheService.delete(`file_${fileId}`);
    return updatedFile;
  }
}
