import express from "express";
import routes from "#routes/index";
import { LoggerMiddleware } from "#middlewares/logger.middleware";
import { errorHandler } from "#middlewares/errorHandler.middleware";

const app = express();

app.use(express.json());
app.use(LoggerMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
