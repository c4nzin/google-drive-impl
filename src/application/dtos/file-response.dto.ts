import { AutoMap } from "@automapper/classes";

export class FileResponseDto {
  @AutoMap()
  id!: string;

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
}
