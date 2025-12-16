import chalk from "chalk";
import { format } from "date-fns";

const LoggerMiddleware = (req, res, next) => {
  const requestTime = format(new Date(), "MM-dd-yyyy HH:mm:ss");

  console.log(
    chalk.cyan(`[${requestTime}]`),
    chalk.yellow(req.method),
    chalk.white(req.url),
    chalk.gray(`- IP: ${req.ip}`)
  );

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const responseTime = format(new Date(), "MM-dd-yyyy HH:mm:ss");

    const statusColor = res.statusCode >= 400 ? chalk.red : chalk.green;

    console.log(
      chalk.cyan(`[${responseTime}]`),
      statusColor(`Response: ${res.statusCode}`),
      chalk.magenta(`- ${duration}ms`),
      chalk.gray(`- ${req.method} ${req.url}`)
    );
  });

  next();
};

export { LoggerMiddleware };
