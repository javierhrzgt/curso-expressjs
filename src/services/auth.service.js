import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AppError } from "#src/utils/error.util";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const registerUser = async (email, password, name) => {

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("El Email ya esta registrado", StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "USER" },
  });
  return newUser;
};

const loginUser = async (email, password) => {

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Email or Password incorrect.",StatusCodes.UNAUTHORIZED);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new AppError("Email or Password incorrect.",StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "4h" }
  );

  return token;
};

export { registerUser, loginUser };
