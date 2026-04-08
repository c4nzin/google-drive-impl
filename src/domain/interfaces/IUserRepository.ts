import { User } from "../entities/User";

export interface IUserRepository {
  //findById
  findById(id: string): Promise<User | null>;

  //findByEmail
  findByEmail(email: string): Promise<User | null>;

  //save
  save(user: User): Promise<User>;

  //update
  update(id: string, user: Partial<User>): Promise<User | null>;

  //delete
  delete(id: string): Promise<void>;

  //findAll
  findAll(): Promise<User[]>;
}
