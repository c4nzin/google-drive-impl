import { User } from "../../domain/entities/User";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../domain/errors/app-error";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../../config/env";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.getUserByEmail(email);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    //replace this badrequesterror with unauthorized error to be more semantically correct but not implemented yet......
    if (!isPasswordValid) {
      throw new BadRequestError(`Invalid credentials`);
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  }

  async register(user: User): Promise<User> {
    await this.getUserByEmail(user.email);

    return this.userRepository.save(user);
  }

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
