import { AppError } from "#utils/error.util";
import { StatusCodes } from "http-status-codes";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Not authenticated", StatusCodes.UNAUTHORIZED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          "Access denied. Insufficient permissions",
          StatusCodes.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
