import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import routeApi from "#routes/index";
import { LoggerMiddleware } from "#middlewares/logger";
import { errorHandler } from "#middlewares/errorHandler";
import { authenticateToken } from "#middlewares/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(LoggerMiddleware);
app.use(errorHandler);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Rutas
routeApi(app);

app.get("/db-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al comunicarse a la base de datos" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, role, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      role: "USER",
      password: hashedPassword,
    },
  });

  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    return res.status(400).json({ error: "Invalid email or password" });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "4h" }
  );

  res.json({ token });
});
