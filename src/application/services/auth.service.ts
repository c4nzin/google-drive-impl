import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import {
  ConflictError,
  UnauthorizedError,
} from "../../domain/errors/app-error";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { buildUserCreatedEvent } from "../dtos/user-created.event";
import { IEventProducer } from "../../domain/interfaces/event-producer.interface";
import { env } from "../../config/env";
import Logger from "../../infrastructure/logger";
import mongoose from "mongoose";
import { OutboxModel } from "../../infrastructure/persistence/schemas/outbox.schema";
export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string,
    private jwtRefreshSecret: string,
    private jwtRefreshExpiresIn: string,
    private eventProducer: IEventProducer,
  ) {}

  async login(email: string, password: string): Promise<User | null> {
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

  async register(data: User): Promise<User> {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const existingUser = await this.userRepository.findByEmail(data.email);

      if (existingUser) {
        throw new ConflictError("Email already in use");
      }

      const saved = await this.userRepository.save(data, { session });

      const event = buildUserCreatedEvent({
        id: saved.id!,
        email: saved.email,
        username: saved.username ?? null,
        firstName: saved.firstName ?? null,
        lastName: saved.lastName ?? null,
        createdAt: saved.createdAt ?? new Date(),
      });

      await OutboxModel.create(
        [
          {
            eventId: event.eventId,
            topic: env.KAFKA_USER_CREATED_TOPIC || "user.created",
            key: saved.id!,
            payload: event,
            status: "pending",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return saved;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async logout(refreshToken: string) {
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

    await this.userRepository.clearRefreshToken(user.id!);
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
