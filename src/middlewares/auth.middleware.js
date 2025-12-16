import jwt from "jsonwebtoken";
import { AppError } from "#utils/error.util";
import { StatusCodes } from "http-status-codes";

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new AppError(
        "Access Denied, no token provided",
        StatusCodes.UNAUTHORIZED
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError(
        "Access Denied, no token provided",
        StatusCodes.UNAUTHORIZED
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid Token", StatusCodes.FORBIDDEN));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", StatusCodes.FORBIDDEN));
    }
    next(error);
  }
}
