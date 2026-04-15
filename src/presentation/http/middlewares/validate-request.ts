import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../../../domain/errors/app-error";

export function validateRequest(
  schema: ZodSchema,
  source: "body" | "query" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const target = source === "query" ? req.query : req.body;
    const result = schema.safeParse(target);

    if (!result.success) {
      const zodError = result.error as ZodError;

      return next(
        new ValidationError(zodError.issues.map((e) => e.message).join(", ")),
      );
    }

    if (source === "body") {
      req.body = result.data as Request["body"];
    } else {
      req.query = result.data as any;
    }

    next();
  };
}
