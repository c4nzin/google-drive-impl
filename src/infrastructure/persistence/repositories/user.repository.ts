import { User } from "../../../domain/entities/user";
import { IUserRepository } from "../../../domain/interfaces/user-repository.interface";
import { UserModel } from "../schemas/user-schema";

export class UserRepository implements IUserRepository {
  constructor(private userModel: typeof UserModel) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async findByEmail(
    email: string,
    options?: { withPassword?: boolean },
  ): Promise<User | null> {
    const query = this.userModel.findOne({ email });

    if (options?.withPassword) {
      query.select("+password");
    }

    return query.exec();
  }

  async save(user: User): Promise<User> {
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
}
