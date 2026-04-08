import express from "express";
import pinoHttp from "pino-http";
import Logger from "./infrastructure/logger";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import cookieParser from "cookie-parser";
import { HttpStatus } from "./domain/errors/status-codes.enum";

//todos : express app init et. OK
//env configini load et OK
//mongodb baglantisini yap OK
//health endpoint ekle OK
//middleware express json OK
//hata durumunda graceful shutdown

async function bootstrap(): Promise<void> {
  const app = express();

  //middlewares
  app.use(pinoHttp({ logger: Logger }));
  app.use(
    express.json({ strict: true, limit: "100kb", type: ["application/json"] }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  //db connection
  await connectDatabase();

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

  //health checker
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
  app
    .listen(env.PORT, () => {
      Logger.info(`Server is running on port ${env.PORT}`);
    })
    .on("error", (err) => {
      Logger.error(`Server error: ${err}`);
      process.exit(1); //graceful shutdown
    });
}

bootstrap();
