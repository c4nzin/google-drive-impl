import { User } from "../../../domain/entities/user";
import {
  IUserRepository,
  QueryOptions,
} from "../../../domain/interfaces/user-repository.interface";
import { UserModel } from "../schemas/user-schema";

export class UserRepository implements IUserRepository {
  constructor(private userModel: typeof UserModel) {}

  async findById(id: string, options?: QueryOptions): Promise<User | null> {
    const query = this.userModel.findById(id);

    if (options?.select?.length) {
      query.select(options.select.join(" "));
    }

    return query.exec();
  }

  async findByEmail(
    email: string,
    options?: QueryOptions,
  ): Promise<User | null> {
    const query = this.userModel.findOne({ email });

    if (options?.select?.length) {
      query.select(options.select.join(" "));
    }

    return query.exec();
  }

  async save(user: User, options?: { session?: any }): Promise<User> {
    if (options?.session) {
      return this.userModel
        .create([user], { session: options.session })
        .then((docs) => docs[0]);
    }

    return this.userModel.create(user);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true });
  }

  async delete(id: string): Promise<void> {
    return this.userModel.findByIdAndDelete(id).then(() => {});
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async clearRefreshToken(id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $unset: { refreshToken: 1 } },
      { new: true },
    );
  }
}
