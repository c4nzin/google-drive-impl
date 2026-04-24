import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  IFileRepository,
  ListFilesOptions,
  ListFilesResult,
} from "../../domain/interfaces/file-repository.interface";
import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import { File } from "../../domain/entities/file";
import { NotFoundError } from "../../domain/errors/app-error";
import { ICacheService } from "../../domain/interfaces";
import { buildFileUploadedEvent } from "../dtos/file-uploaded.event";
import {
  IOutboxRepository,
  OutboxEvent,
} from "../../domain/interfaces/outbox-repository.interface";
import { env } from "../../config/env";

export class FileService {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
    private cacheService: ICacheService,
    private outboxRepository: IOutboxRepository,
  ) {}

  async uploadFile(
    ownerId: string,
    localPath: string,
    originalName: string,
    mimeType: string,
    size: number,
    parentId?: string,
    displayName?: string,
  ): Promise<File> {
    const storageKey = `${ownerId}/${uuidv4()}${path.extname(originalName)}`;

    await this.storageService.saveFile(localPath, storageKey);

    const file = new File();
    file.ownerId = ownerId;
    file.parentId = parentId;
    file.mimeType = mimeType;
    file.size = size;
    file.storageKey = storageKey;
    file.name = displayName ?? originalName;

    const saved = await this.fileRepository.save(file);

    const event = buildFileUploadedEvent({
      id: saved.id!,
      ownerId: saved.ownerId,
      storageKey: saved.storageKey,
      name: saved.name,
      mimeType: saved.mimeType,
      size: saved.size,
      createdAt: saved.createdAt! ?? new Date(),
    });

    const outboxEvent: OutboxEvent = {
      eventId: event.eventId,
      topic: env.KAFKA_FILE_UPLOADED_TOPIC || "file.uploaded",
      key: saved.id!,
      payload: event,
      status: "pending",
      attempts: 0,
    };

    await this.outboxRepository.create(outboxEvent);

    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());

    return saved;
  }

  async downloadFile(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file || !this.canRead(file, ownerId) || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    //await this.cacheService.set(`file_${file.id}`, file, 3600);

    if (file.isFolder) {
      throw new NotFoundError("Folder cannot be downloaded");
    }

    return {
      file,
      stream: this.storageService.getFileStream(file.storageKey),
    };
  }

  async listFiles(ownerId: string, options?: ListFilesOptions) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 20);
    const parentId = options?.parentId!;
    const search = options?.search?.trim();

    const opts: ListFilesOptions = {
      page,
      limit,
      parentId,
      search,
    };

    const version =
      (await this.cacheService.get<number>(`file-list-version_${ownerId}`)) ??
      0;
    const cacheKey = `file-list_${ownerId}_${version}_${page}_${limit}_${parentId ?? ""}_${search ?? ""}`;

    const cached = await this.cacheService.get<ListFilesResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.fileRepository.findByUserWithFilter(
      ownerId,
      opts,
    );

    await this.cacheService.set(cacheKey, result, 3600);

    return result;
  }

  async deleteFile(fileId: string, ownerId: string) {
    const file = await this.fileRepository.findById(fileId);

    if (!file || !this.canWrite(file, ownerId) || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    await this.storageService.deleteFile(file.storageKey);
    await this.fileRepository.delete(fileId);

    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());
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

    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());
    await this.cacheService.delete(`file_${fileId}`);
    return updatedFile;
  }

  async createFolder(
    ownerId: string,
    name: string,
    parentId?: string,
  ): Promise<File> {
    const folder = new File();
    folder.ownerId = ownerId;
    folder.parentId = parentId;
    folder.name = name;
    folder.mimeType = "folder";
    folder.size = 0;
    folder.storageKey = "";
    folder.isFolder = true;

    const saved = await this.fileRepository.save(folder);

    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());

    return saved;
  }

  async shareFile(
    fileId: string,
    ownerId: string,
    targetUserId: string,
    permission: "read" | "write",
  ) {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    const sharedWith = file.sharedWith ?? [];
    const existingIndex = sharedWith.findIndex(
      (entry) => entry.userId === targetUserId,
    );

    if (existingIndex >= 0) {
      sharedWith[existingIndex].permission = permission;
    } else {
      sharedWith.push({ userId: targetUserId, permission });
    }

    await this.fileRepository.update(fileId, { sharedWith });
    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());
    await this.cacheService.set(
      `file-list-version_${targetUserId}`,
      Date.now(),
    );
  }

  async unshareFile(fileId: string, ownerId: string, targetUserId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.ownerId !== ownerId || file.isDeleted) {
      throw new NotFoundError("File not found or access denied");
    }

    const sharedWith = (file.sharedWith ?? []).filter(
      (entry) => entry.userId !== targetUserId,
    );

    await this.fileRepository.update(fileId, { sharedWith });
    await this.cacheService.set(`file-list-version_${ownerId}`, Date.now());
    await this.cacheService.set(
      `file-list-version_${targetUserId}`,
      Date.now(),
    );
  }

  private canRead(file: File, userId: string) {
    return (
      file.ownerId === userId ||
      file.sharedWith?.some((entry) => entry.userId === userId)
    );
  }

  private canWrite(file: File, userId: string) {
    return (
      file.ownerId === userId ||
      file.sharedWith?.some(
        (entry) => entry.userId === userId && entry.permission === "write",
      )
    );
  }
}
