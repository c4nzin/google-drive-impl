export interface IDatabaseSession {
  endSession(): Promise<void>;
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  getNativeSession(): any;
}

export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startSession(): Promise<IDatabaseSession>;
  isConnected(): boolean;
  getNativeClient(): any;
}
