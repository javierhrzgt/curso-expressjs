import { PrismaClient } from "@prisma/client";
import { AppError } from "#utils/error.util";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const createTimeBlockService = async (startTime, endTime) => {
  if (!startTime || !endTime) {
    throw new AppError(
      "startTime and endTime are required",
      StatusCodes.BAD_REQUEST
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError("Invalid date format", StatusCodes.BAD_REQUEST);
  }

  if (start >= end) {
    throw new AppError(
      "startTime must be before endTime",
      StatusCodes.BAD_REQUEST
    );
  }

  const newTimeBlock = await prisma.timeBlock.create({
    data: {
      startTime: start,
      endTime: end,
    },
  });

  return newTimeBlock;
};

export const listReservationsService = async () => {
  const reservations = await prisma.appointment.findMany({
    include: {
      user: true,
      timeBlock: true,
    },
  });

  return reservations;
};
