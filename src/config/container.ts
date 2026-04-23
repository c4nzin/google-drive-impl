import { createContainer, asClass, asValue, InjectionMode } from "awilix";
import { UserModel } from "../infrastructure/persistence/schemas/user-schema";
import { UserService } from "../application/services/user.service";
import { UserController } from "../presentation/http/controllers/user.controller";
import { UserRoutes } from "../presentation/http/routes/user-routes";
import { AuthService } from "../application/services/auth.service";
import { AuthController } from "../presentation/http/controllers/auth-controller";
import { AuthRoutes } from "../presentation/http/routes/auth.routes";
import { env } from "./env";
import { LocalStrategy } from "../infrastructure/passport/local.strategy";
import { JwtStrategy } from "../infrastructure/passport/jwt-strategy";
import { UserRepository } from "../infrastructure/persistence/repositories/user.repository";
import { LocalStorageService } from "../infrastructure/storage/local-storage.service";
import { FileService } from "../application/services/file.service";
import { FileRepository } from "../infrastructure/persistence/repositories/file.repository";
import { FileController } from "../presentation/http/controllers/file.controller";
import { FileRoutes } from "../presentation/http/routes/file.routes";
import { S3StorageService } from "../infrastructure/storage/s3-storage.service";
import { KeyvCacheService } from "../infrastructure/cache/keyv-cache.service";
import { KafkaProducer } from "../infrastructure/messaging/kafka.producer";
import { SmtpEmailService } from "../infrastructure/email/smtp-email.service";
import { EmailService } from "../application/services/email.service";
import { emailQueue } from "../infrastructure/queue/email.queue";
import { BullQueue } from "../infrastructure/queue/bull.queue";

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

const storageServiceRegistration =
  env.STORAGE_PROVIDER === "s3"
    ? asClass(S3StorageService).singleton()
    : asClass(LocalStorageService).singleton();

container.register({
  userModel: asValue(UserModel),

  jwtSecret: asValue(env.JWT_SECRET),
  jwtExpiresIn: asValue(env.JWT_EXPIRES_IN),
  jwtRefreshSecret: asValue(env.JWT_REFRESH_SECRET),
  jwtRefreshExpiresIn: asValue(env.JWT_REFRESH_EXPIRES_IN),

  userRepository: asClass(UserRepository).singleton(),
  userService: asClass(UserService).singleton(),
  userController: asClass(UserController).scoped(),
  userRoutes: asClass(UserRoutes).scoped(),

  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).scoped(),
  authRoutes: asClass(AuthRoutes).scoped(),
  localStrategy: asClass(LocalStrategy).singleton(),
  jwtStrategy: asClass(JwtStrategy).singleton(),
  storageService: storageServiceRegistration,
  fileRepository: asClass(FileRepository).singleton(),
  fileService: asClass(FileService).singleton(),
  fileController: asClass(FileController).scoped(),
  fileRoutes: asClass(FileRoutes).scoped(),

  cacheService: asClass(KeyvCacheService).singleton(),

  //kafka
  eventProducer: asClass(KafkaProducer).singleton(),

  //email related
  emailProvider: asClass(SmtpEmailService).singleton(),
  emailService: asClass(EmailService).singleton(),
  emailQueue: asValue(emailQueue),
  queue: asClass(BullQueue).singleton(),
});

export default container;
