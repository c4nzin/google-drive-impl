import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema, z } from "zod";
import { ValidationError } from "../../../domain/errors/app-error";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;

      return next(
        new ValidationError(zodError.issues.map((e) => e.message).join(", ")),
      );
    }

    req.body = result.data as Request["body"];

    next();
  };
}
