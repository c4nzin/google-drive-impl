import { env } from "../../../config/env";
import { User } from "../../../domain/entities/user";
import {
  IUserRepository,
  QueryOptions,
} from "../../../domain/interfaces/user-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";
import { UserModel } from "../schemas/user-schema";
import { MongoUserRepository } from "./mongo-user.repository";
import { PostgresUserRepository } from "./postgres-user.repository";

export class UserRepository implements IUserRepository {
  private repository: IUserRepository;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.repository =
      env.DB_PROVIDER === "postgres"
        ? new PostgresUserRepository(databaseAdapter)
        : new MongoUserRepository(UserModel);
  }

  findById(id: string, options?: QueryOptions): Promise<User | null> {
    return this.repository.findById(id, options);
  }

  findByEmail(email: string, options?: QueryOptions): Promise<User | null> {
    return this.repository.findByEmail(email, options);
  }

  save(user: User, options?: { session?: any }): Promise<User> {
    return this.repository.save(user, options);
  }

  update(id: string, user: Partial<User>): Promise<User | null> {
    return this.repository.update(id, user);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  clearRefreshToken(id: string): Promise<User | null> {
    return this.repository.clearRefreshToken(id);
  }
}
