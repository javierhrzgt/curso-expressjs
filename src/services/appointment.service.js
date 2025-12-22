import { PrismaClient } from "@prisma/client";
import { AppError } from "#utils/error.util";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getUserAppointments = async (userId) => {
  if (!userId || isNaN(userId)) {
    throw new AppError("Invalid user ID", StatusCodes.BAD_REQUEST);
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: parseInt(userId, 10) },
    include: {
      timeBlock: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return appointments;
};