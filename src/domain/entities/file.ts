import { AutoMap } from "@automapper/classes";

export type FilePermission = "read" | "write" | "delete";

export type SharedWithEntry = {
  userId: string;
  permission: FilePermission;
};

export class File {
  @AutoMap()
  id?: string;

  @AutoMap()
  ownerId!: string;

  @AutoMap()
  parentId?: string;

  @AutoMap()
  name!: string;

  @AutoMap()
  mimeType!: string;

  @AutoMap()
  size!: number;

  @AutoMap()
  storageKey!: string;

  @AutoMap()
  isDeleted?: boolean;

  @AutoMap()
  createdAt?: Date;

  @AutoMap()
  updatedAt?: Date;

  @AutoMap()
  sharedWith?: SharedWithEntry[];

  @AutoMap()
  isFolder?: boolean;
}
