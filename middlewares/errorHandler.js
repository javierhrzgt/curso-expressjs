import chalk from "chalk";
import { format } from "date-fns";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Ocurrió un Error inesperado";

  const statusColor = res.statusCode >= 400 ? chalk.red : chalk.green;

  console.error(
    chalk.cyan(`[ERROR] ${format(new Date(), "MM-DD-yyyy HH:mm:ss")}`),
    statusColor(`- ${statusCode}`),
    chalk.white(`- ${message}`)
  );

  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  next();
};

export { errorHandler };
