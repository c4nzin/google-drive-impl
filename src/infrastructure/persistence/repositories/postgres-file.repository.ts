import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import { File } from "../../../domain/entities/file";
import {
  IFileRepository,
  ListFilesOptions,
  ListFilesResult,
} from "../../../domain/interfaces/file-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";

export class PostgresFileRepository implements IFileRepository {
  private db: Knex;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.db = databaseAdapter.getNativeClient();
  }

  private mapFile(row: any): File | null {
    if (!row) return null;
    return {
      id: row.id,
      ownerId: row.ownerId,
      parentId: row.parentId,
      name: row.name,
      mimeType: row.mimeType,
      size: row.size,
      storageKey: row.storageKey,
      isFolder: row.isFolder,
      sharedWith: row.sharedWith,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByIdOwnerWithFilter(
    ownerId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult> {
    const query: any = this.db<File>("files").where({
      ownerId,
      isDeleted: false,
    });

    if (options?.parentId) {
      query.andWhere({ parentId: options.parentId });
    }

    if (options?.search) {
      query.andWhere("name", "ilike", `%${options.search}%`);
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 20);
    const offset = (page - 1) * limit;

    const [files, countResult] = await Promise.all([
      query.clone().offset(offset).limit(limit).select("*"),
      this.db<File>("files")
        .where({ ownerId, isDeleted: false })
        .modify((qb) => {
          if (options?.parentId) qb.andWhere({ parentId: options.parentId });
          if (options?.search)
            qb.andWhere("name", "ilike", `%${options.search}%`);
        })
        .count<{ count: string }>("id as count")
        .first(),
    ]);

    return {
      files: files.map((row: any) => this.mapFile(row)!).filter(Boolean),
      total: Number(countResult?.count ?? 0),
      page,
      limit,
    };
  }

  async save(file: File): Promise<File> {
    const id = file.id ?? uuidv4();

    const row = {
      id,
      ownerId: file.ownerId,
      parentId: file.parentId,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      storageKey: file.storageKey,
      isFolder: file.isFolder ?? false,
      sharedWith: file.sharedWith ?? [],
      isDeleted: file.isDeleted ?? false,
      createdAt: file.createdAt ?? new Date(),
      updatedAt: file.updatedAt ?? new Date(),
    };

    const [created] = await this.db<File>("files").insert(row).returning("*");
    return this.mapFile(created)!;
  }

  async findById(id: string): Promise<File | null> {
    const row = await this.db<File>("files").where({ id }).first();
    return this.mapFile(row);
  }

  async findByOwner(ownerId: string): Promise<File[]> {
    const rows = await this.db<File>("files")
      .where({ ownerId, isDeleted: false })
      .select("*");
    return rows.map((row: any) => this.mapFile(row)!).filter(Boolean);
  }

  async update(id: string, data: Partial<File>): Promise<File | null> {
    const rows = await this.db<File>("files")
      .where({ id })
      .update({ ...data, updatedAt: new Date() })
      .returning("*");

    return this.mapFile(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db<File>("files")
      .where({ id })
      .update({ isDeleted: true, updatedAt: new Date() });
  }

  async findByUserWithFilter(
    userId: string,
    options?: ListFilesOptions,
  ): Promise<ListFilesResult> {
    const query = this.db<File>("files")
      .where({ isDeleted: false })
      .andWhere((qb) => {
        qb.where({ ownerId: userId }).orWhereRaw("sharedWith @> ?", [
          JSON.stringify([{ userId }]),
        ]);
      });

    if (options?.parentId) {
      query.andWhere({ parentId: options.parentId });
    }

    if (options?.search) {
      query.andWhere("name", "ilike", `%${options.search}%`);
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 20);
    const offset = (page - 1) * limit;

    const [files, countResult] = await Promise.all([
      query.clone().offset(offset).limit(limit).select("*"),
      this.db<File>("files")
        .where({ isDeleted: false })
        .andWhere((qb) => {
          qb.where({ ownerId: userId }).orWhereRaw("sharedWith @> ?", [
            JSON.stringify([{ userId }]),
          ]);
        })
        .modify((qb) => {
          if (options?.parentId) qb.andWhere({ parentId: options.parentId });
          if (options?.search)
            qb.andWhere("name", "ilike", `%${options.search}%`);
        })
        .count<{ count: string }>("id as count")
        .first(),
    ]);

    return {
      files: files.map((row: any) => this.mapFile(row)!).filter(Boolean),
      total: Number(countResult?.count ?? 0),
      page,
      limit,
    };
  }
}
