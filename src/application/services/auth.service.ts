import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import {
  ConflictError,
  UnauthorizedError,
} from "../../domain/errors/app-error";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = await this.generateToken(user);

    return token;
  }

  async register(data: User): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    return this.userRepository.save(data);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async generateToken(user: User) {
    return jwt.sign({ userId: user.id, email: user.email }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    });
  }
}
