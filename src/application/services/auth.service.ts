import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import {
  IOutboxRepository,
  OutboxEvent,
} from "../../domain/interfaces/outbox-repository.interface";
import {
  ConflictError,
  UnauthorizedError,
} from "../../domain/errors/app-error";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { buildUserCreatedEvent } from "../dtos/user-created.event";
import { IEventProducer } from "../../domain/interfaces/event-producer.interface";
import { IDatabaseAdapter } from "../../domain/interfaces/database-interface";
import { env } from "../../config/env";
import Logger from "../../infrastructure/logger";

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private databaseAdapter: IDatabaseAdapter,
    private outboxRepository: IOutboxRepository,
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
    const session = await this.databaseAdapter.startSession();

    try {
      const saved = await session.withTransaction(async () => {
        const existingUser = await this.userRepository.findByEmail(data.email);

        if (existingUser) {
          throw new ConflictError("Email already in use");
        }

        const created = await this.userRepository.save(data, {
          session: session.getNativeSession(),
        });

        const event = buildUserCreatedEvent({
          id: created.id!,
          email: created.email,
          username: created.username ?? null,
          firstName: created.firstName ?? null,
          lastName: created.lastName ?? null,
          createdAt: created.createdAt ?? new Date(),
        });

        const outboxEvent: OutboxEvent = {
          eventId: event.eventId,
          topic: env.KAFKA_USER_CREATED_TOPIC || "user.created",
          key: created.id!,
          payload: event,
          status: "pending",
        };

        await this.outboxRepository.create(outboxEvent, {
          session: session.getNativeSession(),
        });

        return created;
      });

      return saved;
    } finally {
      await session.endSession();
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
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

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
