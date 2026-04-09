import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../../../domain/errors/app-error";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const zodError = result.error as ZodError;

      return next(
        new ValidationError(zodError.issues.map((e) => e.message).join(", ")),
      );
    }

    const data = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
    req.body = data.body as Request["body"];
    req.params = data.params as Request["params"];
    req.query = data.query as Request["query"];

    next();
  };
}
