import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../../domain/errors/app-error";

export function requireFile(req: Request, res: Response, next: NextFunction) {
  const hasSingle = !!(req as any).file;
  const files = (req as any).files;
  const hasMultiple = Array.isArray(files)
    ? files.length > 0
    : files && Object.keys(files).length > 0;

  if (!hasSingle && !hasMultiple) {
    return next(new ValidationError("No file uploaded"));
  }

  next();
}
