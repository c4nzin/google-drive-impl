import mongoose from "mongoose";
import { File } from "../../../domain/entities/file";

const FileSchema = new mongoose.Schema<File>(
  {
    id: { type: String },
    ownerId: { type: String, required: true, index: true },
    parentId: { type: String, index: true, required: false },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isFolder: { type: Boolean, default: false },
    sharedWith: [
      {
        userId: { type: String, required: true },
        permission: {
          type: String,
          enum: ["read", "write", "delete"],
          default: "read",
        },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const FileModel = mongoose.model<File>(File.name, FileSchema);
