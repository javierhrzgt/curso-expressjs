import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { LoggerMiddleware } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const prisma = new PrismaClient();
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

app.get("/db-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users)
  } catch (error) {
    res.status(500).json({ error:"Error al comunicarse a la base de datos"})
  }
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});
