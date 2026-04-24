import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../../domain/entities/user";
import {
  IUserRepository,
  QueryOptions,
} from "../../../domain/interfaces/user-repository.interface";
import { IDatabaseAdapter } from "../../../domain/interfaces";

export class PostgresUserRepository implements IUserRepository {
  private db: Knex;

  constructor(databaseAdapter: IDatabaseAdapter) {
    this.db = databaseAdapter.getNativeClient();
  }

  private mapUser(row: any): User | null {
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      refreshToken: row.refreshToken,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private applySelect(query: Knex.QueryBuilder, options?: QueryOptions) {
    if (options?.select?.length) {
      const columns = options.select.map((column) => column.replace(/^\+/, ""));
      query.select(columns);
    }
  }

  async findById(id: string, options?: QueryOptions): Promise<User | null> {
    const query = this.db<User>("users").where({ id });
    this.applySelect(query, options);
    const row = await query.first();
    return this.mapUser(row);
  }

  async findByEmail(
    email: string,
    options?: QueryOptions,
  ): Promise<User | null> {
    const query = this.db<User>("users").where({ email });
    this.applySelect(query, options);
    const row = await query.first();
    return this.mapUser(row);
  }

  async save(user: User, options?: { session?: any }): Promise<User> {
    const id = user.id ?? uuidv4();
    const row = {
      id,
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      refreshToken: user.refreshToken,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };

    const query = this.db<User>("users").insert(row).returning("*");
    if (options?.session) {
      query.transacting(options.session);
    }

    const [created] = await query;
    return this.mapUser(created)!;
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const row = await this.db<User>("users")
      .where({ id })
      .update({ ...user, updatedAt: new Date() })
      .returning("*");
    return this.mapUser(row[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db<User>("users").where({ id }).del();
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db<User>("users").select("*");
    return rows.map((row) => this.mapUser(row)!);
  }

  async clearRefreshToken(id: string): Promise<User | null> {
    const row = await this.db<User>("users")
      .where({ id })
      .update({ refreshToken: null as any, updatedAt: new Date() })
      .returning("*");
    return this.mapUser(row[0]);
  }
}
