import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env";

export interface FileUploadedEvent {
  eventId: string;
  type: string;
  version: string;
  timestamp: number;
  data: {
    id: string;
    ownerId: string;
    storageKey: string;
    name: string;
    mimeType: string;
    size: number;
    createdAt: string;
  };
}

export function buildFileUploadedEvent(file: {
  id: string;
  ownerId: string;
  storageKey: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}): FileUploadedEvent {
  return {
    eventId: uuidv4(),
    type: env.KAFKA_FILE_UPLOADED_TOPIC!,
    version: "v1",
    timestamp: Date.now(),
    data: {
      id: file.id,
      ownerId: file.ownerId,
      storageKey: file.storageKey,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt.toISOString(),
    },
  };
}
