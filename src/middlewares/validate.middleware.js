import { AppError } from "#src/utils/error.util";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (!(error instanceof ZodError)) {
        return next(error);
      }

      const validateErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      const err = new AppError(
        "Errores de validación",
        StatusCodes.BAD_REQUEST
      );
      err.errors = validateErrors;
      return next(err);
    }
  };
};
