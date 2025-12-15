import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { LoggerMiddleware } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middleware
app.use(LoggerMiddleware);
app.use(errorHandler);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Rutas
app.use("/", testRoutes);
app.use("/users", userRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});