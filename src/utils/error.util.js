import { StatusCodes } from "http-status-codes";

class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
