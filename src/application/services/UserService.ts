import { User } from "../../domain/entities/User";
import { ConflictError, NotFoundError } from "../../domain/errors/app-error";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    return user;
  }

  async createUser(user: User): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(user.email);

    if (existingUser) {
      throw new ConflictError(`User with email ${user.email} already exists`);
    }

    return this.userRepository.save(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return this.userRepository.update(id, user) as Promise<User>;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
