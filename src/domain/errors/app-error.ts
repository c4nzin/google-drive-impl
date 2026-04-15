import { ERROR_MESSAGES } from "./app-error.constant";
import { HttpStatus } from "./status-codes.enum";

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
    super(
      HttpStatus.BadRequest,
      `Validation error: ${details}`,
      ERROR_MESSAGES.VALIDATION_ERROR,
    );
  }
}

export class NotFoundError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.NotFound,
      `Not found: ${details}`,
      ERROR_MESSAGES.NOT_FOUND_ERROR,
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.Unauthorized,
      `Unauthorized: ${details}`,
      ERROR_MESSAGES.UNAUTHORIZED_ERROR,
    );
  }
}

export class ForbiddenError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.Forbidden,
      `Forbidden: ${details}`,
      ERROR_MESSAGES.FORBIDDEN_ERROR,
    );
  }
}

export class InternalServerError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.InternalServerError,
      `Internal Server Error: ${details}`,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      true,
    );
  }
}

export class ConflictError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.Conflict,
      `Conflict: ${details}`,
      ERROR_MESSAGES.CONFLICT_ERROR,
    );
  }
}

export class BadRequestError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.BadRequest,
      `Bad Request: ${details}`,
      ERROR_MESSAGES.BAD_REQUEST_ERROR,
    );
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(details: string) {
    super(
      HttpStatus.InternalServerError,
      `Database Connection Error: ${details}`,
      ERROR_MESSAGES.DATABASE_CONNECTION_ERROR,
      true,
    );
  }
}
