import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../domain/errors/app-error";
import Logger from "../../../infrastructure/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    const { code, message, isCatastrophic, name, statusCode, stack } = err;

    if (isCatastrophic) {
      Logger.info(
        `Catastrophic error occurred: ${name} - ${message} - Stack: ${stack} - Path : ${req.path}`,
      );
      process.exit(1); //graceful shutdown
    }

    return res.status(statusCode).json({
      statusCode,
      code,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
  });
}
