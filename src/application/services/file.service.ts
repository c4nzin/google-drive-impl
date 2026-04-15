import path from "path";
import { v4 as uuidv4 } from "uuid";
import { IFileRepository } from "../../domain/interfaces/file-repository.interface";
import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import { File } from "../../domain/entities/file";
import { NotFoundError } from "../../domain/errors/app-error";

export class FileService {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
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

    return this.fileRepository.save(file);
  }

  async downloadFile(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    return {
      file,
      stream: await this.storageService.getFileStream(file.storageKey),
    };
  }

  async listFiles(ownerId: string) {
    return this.fileRepository.findByOwner(ownerId);
  }
}
