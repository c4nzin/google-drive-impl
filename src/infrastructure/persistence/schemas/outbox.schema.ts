import { model, Schema } from "mongoose";

export interface OutboxDocument {
  eventId: string;
  topic: string;
  key?: string | null;
  payload: any;
  status: "pending" | "published" | "failed";
  attempts: number;
  lastError?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
}

const OutBoxSchema = new Schema<OutboxDocument>({
  eventId: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  key: { type: String, default: null },
  payload: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ["pending", "published", "failed"],
    default: "pending",
  },
  attempts: { type: Number, default: 0 },
  lastError: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
  publishedAt: { type: Date, default: null },
});

export const OutboxModel = model<OutboxDocument>("Outbox", OutBoxSchema);
