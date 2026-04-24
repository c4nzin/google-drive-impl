import mongoose from "mongoose";
import { IDatabaseAdapter, IDatabaseSession } from "../../../domain/interfaces";
import { env } from "../../../config/env";

export class MongooseSession implements IDatabaseSession {
  constructor(private session: mongoose.ClientSession) {}

  async endSession() {
    await this.session.endSession();
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.session.withTransaction(fn);
  }

  getNativeSession() {
    return this.session;
  }
}

export class MongoDatabaseAdapter implements IDatabaseAdapter {
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    await mongoose.connect(env.DATABASE_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.connected = false;
  }

  async startSession() {
    const session = await mongoose.startSession();
    return new MongooseSession(session);
  }

  isConnected(): boolean {
    return this.connected;
  }

  getNativeClient(): any {
    return mongoose.connection;
  }
}
