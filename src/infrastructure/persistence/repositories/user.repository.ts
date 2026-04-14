import { User } from "../../../domain/entities/user";
import { IUserRepository } from "../../../domain/interfaces/user-repository.interface";
import { UserModel } from "../schemas/user-schema";

export class UserRepository implements IUserRepository {
  constructor(private userModel: typeof UserModel) {} //burada direkt import ile yapmak yerine constrcutordan aldimki awilix ile container a eklerken daha esnek olsun diye test vs...

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
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
