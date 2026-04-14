import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import {
  ConflictError,
  UnauthorizedError,
} from "../../domain/errors/app-error";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string,
    private jwtRefreshSecret: string,
    private jwtRefreshExpiresIn: string,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email, {
      select: ["+password"],
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = await this.generateAccessToken(user);

    return token;
  }

  async register(data: User): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    return this.userRepository.save(data);
  }

  async createTokens(user: User) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.userRepository.update(user.id!, { refreshToken });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    let payload: { userId: string };

    try {
      payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as {
        userId: string;
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await this.userRepository.findById(payload.userId, {
      select: ["+refreshToken"],
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    //cr token for user.
    return this.createTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email, {
      select: ["+password"],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private async generateAccessToken(user: User) {
    return jwt.sign({ userId: user.id, email: user.email }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    });
  }

  private async generateRefreshToken(user: User) {
    return jwt.sign({ userId: user.id }, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn as any,
    });
  }
}
