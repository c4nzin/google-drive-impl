import express from "express";
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
import {
  authLimiter,
  globalLimiter,
} from "./presentation/http/middlewares/rate-limiter";
import helmet from "helmet";

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(pinoHttp({ logger: Logger }));
  app.use(
    express.json({ strict: true, limit: "100kb", type: ["application/json"] }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(globalLimiter);
  app.use(helmet());

  app.use(passport.initialize());
  passport.use(container.resolve<LocalStrategy>("localStrategy"));

  await connectDatabase();

  app.use((req, res, next) => {
    req.container = container.createScope();
    next();
  });

  app.use("/users", (req, res, next) => {
    req.container.resolve<UserRoutes>("userRoutes").router(req, res, next);
  });

  app.use("/auth", authLimiter, (req, res, next) => {
    req.container.resolve<AuthRoutes>("authRoutes").router(req, res, next);
  });

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

  app.get("/health", async (req, res) => {
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
    .on("error", (err) => {
      Logger.error(`Server error: ${err}`);
      process.exit(1);
    });
}

bootstrap();
