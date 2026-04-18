import { User } from "../entities/user";

export interface QueryOptions {
  select?: Array<string>;
}

export interface SaveOptions {
  session?: any;
}

export interface IUserRepository {
  findById(id: string, options?: QueryOptions): Promise<User | null>;

  findByEmail(email: string, options?: QueryOptions): Promise<User | null>;

  save(user: User, options?: SaveOptions): Promise<User>;

  update(id: string, user: Partial<User>): Promise<User | null>;

  delete(id: string): Promise<void>;

  findAll(): Promise<User[]>;

  clearRefreshToken(id: string): Promise<User | null>;
}
