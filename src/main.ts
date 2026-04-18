import express, { Request, Response } from "express";
import pinoHttp from "pino-http";
import Logger from "./infrastructure/logger";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import cookieParser from "cookie-parser";
import { HttpStatus } from "./domain/errors/status-codes.enum";
import { UserRoutes } from "./presentation/http/routes/user-routes";
import { AuthRoutes } from "./presentation/http/routes/auth.routes";
import container from "./config/container";
import { errorHandler } from "./presentation/http/middlewares/error-handler";
import passport from "passport";
import { LocalStrategy } from "./infrastructure/passport/local.strategy";
import "reflect-metadata";
import "./application/profiles/user.profile";
import "./application/profiles/file.profile";
import {
  authLimiter,
  globalLimiter,
} from "./presentation/http/middlewares/rate-limiter";
import helmet from "helmet";
import { buildSwagger } from "./presentation/http/swagger/swagger.builder";
import { JwtStrategy } from "./infrastructure/passport/jwt-strategy";
import { FileRoutes } from "./presentation/http/routes/file.routes";
import { asValue } from "awilix";
import { createKafkaTopic } from "./create-kafka.topic";

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(pinoHttp({ logger: Logger }));
  app.use(
    express.json({ strict: true, limit: "100kb", type: ["application/json"] }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(HttpStatus.NoContent);
    }

    next();
  });

  if (env.NODE_ENV === "development") {
    await buildSwagger(app);
  }
  app.use(globalLimiter);
  app.use(helmet());

  app.use(passport.initialize());
  passport.use(container.resolve<JwtStrategy>("jwtStrategy"));

  passport.use(container.resolve<LocalStrategy>("localStrategy"));

  await createKafkaTopic();
  await connectDatabase();

  try {
    const kafkaProducer: any = container.resolve("eventProducer");
    if (kafkaProducer && typeof kafkaProducer.connect === "function") {
      await kafkaProducer.connect();
      Logger.info("Connected to Kafka successfully");
    }
  } catch (error) {
    Logger.warn(`Failed to connect to Kafka: ${(error as Error).message}`);
  }

  app.use((req: Request, res: Response, next) => {
    req.container = container.createScope();
    next();
  });

  app.use("/users", (req: Request, res: Response, next) => {
    req.container.resolve<UserRoutes>("userRoutes").router(req, res, next);
  });

  app.use("/auth", authLimiter, (req: Request, res: Response, next) => {
    req.container.resolve<AuthRoutes>("authRoutes").router(req, res, next);
  });

  app.use("/files", (req, res, next) => {
    req.container.resolve<FileRoutes>("fileRoutes").router(req, res, next);
  });

  app.get("/health", async (req: Request, res: Response) => {
    try {
      const dbCheck = (await connectDatabase()).connection.readyState === 1; // 1 == connected

      return res.status(HttpStatus.OK).json({
        status: "ok",
        database: dbCheck ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error(`Health check error: ${error}`);
      return res.status(HttpStatus.InternalServerError).json({
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use(errorHandler);

  app
    .listen(env.PORT, () => {
      Logger.info(`Server is running on port ${env.PORT}`);
    })
    .on("error", (err: Error) => {
      Logger.error(`Server error: ${err}`);
      process.exit(1);
    });
}

bootstrap();
