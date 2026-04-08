import { ERROR_MESSAGES } from "./app-error.constant";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public isCatastrophic: boolean = false,
  ) {
    super(message);

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(details: string) {
    super(400, `Validation error: ${details}`, ERROR_MESSAGES.VALIDATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(details: string) {
    super(404, `Not found: ${details}`, ERROR_MESSAGES.NOT_FOUND_ERROR);
  }
}

export class UnauthorizedError extends AppError {
  constructor(details: string) {
    super(401, `Unauthorized: ${details}`, ERROR_MESSAGES.UNAUTHORIZED_ERROR);
  }
}

export class ForbiddenError extends AppError {
  constructor(details: string) {
    super(403, `Forbidden: ${details}`, ERROR_MESSAGES.FORBIDDEN_ERROR);
  }
}

export class InternalServerError extends AppError {
  constructor(details: string) {
    super(
      500,
      `Internal Server Error: ${details}`,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      true,
    );
  }
}

export class ConflictError extends AppError {
  constructor(details: string) {
    super(409, `Conflict: ${details}`, ERROR_MESSAGES.CONFLICT_ERROR);
  }
}

export class BadRequestError extends AppError {
  constructor(details: string) {
    super(400, `Bad Request: ${details}`, ERROR_MESSAGES.BAD_REQUEST_ERROR);
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(details: string) {
    super(
      500,
      `Database Connection Error: ${details}`,
      ERROR_MESSAGES.DATABASE_CONNECTION_ERROR,
      true,
    );
  }
}
