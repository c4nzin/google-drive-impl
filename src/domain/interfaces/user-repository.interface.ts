import { User } from "../entities/user";

export interface QueryOptions {
  select?: string[];
}
export interface IUserRepository {
  //findById
  findById(id: string, options?: QueryOptions): Promise<User | null>;

  //findByEmail
  findByEmail(email: string, options?: QueryOptions): Promise<User | null>;

  //save
  save(user: User): Promise<User>;

  //update
  update(id: string, user: Partial<User>): Promise<User | null>;

  //delete
  delete(id: string): Promise<void>;

  //findAll
  findAll(): Promise<User[]>;
}
