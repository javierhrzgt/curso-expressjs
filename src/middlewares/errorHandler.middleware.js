import chalk from "chalk";
import { format } from "date-fns";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Ocurrió un Error inesperado";

  const statusColor = statusCode >= 400 ? chalk.red : chalk.green;

  console.error(
    chalk.cyan(`[ERROR] ${format(new Date(), "MM-dd-yyyy HH:mm:ss")}`),
    statusColor(`- ${statusCode}`),
    chalk.white(`- ${message}`)
  );

  // Solo muestra stack trace para errores 500+ (errores del servidor)
  if (err.stack && statusCode >= 500) {
    console.error(chalk.red(err.stack));
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(err.errors && { errors: err.errors }), // Incluye errores de validación
    ...(process.env.NODE_ENV === "development" &&
      statusCode >= 500 && { stack: err.stack }),
  });
};

export { errorHandler };
