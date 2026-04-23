export interface JobData {
  [key: string]: any;
}

export type ProcessHandler<T extends JobData = JobData> = (
  data: T,
) => Promise<void> | void;

export interface IQueue<T extends JobData = JobData> {
  add(name: string, data: T, opts?: Record<string, any>): Promise<void>;
  process(name: string, handler: ProcessHandler<T>): void;
  waitUntilReady(): Promise<any>;
  close(): Promise<void>;
}
