import { PrismaClient } from "@prisma/client";
import { AppError } from "#utils/error.util";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const createReservation = async (data, userId) => {
  // Validaciones básicas
  if (!data.timeBlockId || !data.date) {
    throw new AppError(
      "timeBlockId and date are required", // Corregí "adn" → "and"
      StatusCodes.BAD_REQUEST
    );
  }

  // Verifica que el timeBlock exista
  const timeBlock = await prisma.timeBlock.findUnique({
    where: { id: data.timeBlockId },
  });

  if (!timeBlock) {
    throw new AppError("Time block not found", StatusCodes.NOT_FOUND);
  }

  // Verifica conflictos
  const conflict = await prisma.appointment.findFirst({
    where: {
      date: new Date(data.date),
      timeBlockId: data.timeBlockId,
    },
  });

  if (conflict) {
    throw new AppError(
      "Time block already booked for this date",
      StatusCodes.CONFLICT
    );
  }

  // Crea la reservación - AQUÍ ESTABA EL ERROR
  const reservation = await prisma.appointment.create({
    data: {
      date: new Date(data.date),
      timeBlockId: data.timeBlockId,
      userId, // ← Faltaba esto
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      timeBlock: true,
    },
  });

  return reservation;
};

export const getReservation = async (id, userId) => {
  const reservation = await prisma.appointment.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      timeBlock: true,
    },
  });

  if (!reservation) {
    return null;
  }

  // Verifica que la reservación pertenezca al usuario
  if (reservation.userId !== userId) {
    throw new AppError(
      "Access denied. This reservation belongs to another user",
      StatusCodes.FORBIDDEN
    );
  }

  return reservation;
};

export const updateReservation = async (id, userId, data) => {
  const reservation = await prisma.appointment.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!reservation) {
    throw new AppError("Reservation not found", StatusCodes.NOT_FOUND);
  }

  if (reservation.userId !== userId) {
    throw new AppError(
      "Access denied. You can only update your own reservations",
      StatusCodes.FORBIDDEN
    );
  }

  // Verifica conflictos solo si está cambiando fecha o timeBlock
  if (data.date || data.timeBlockId) {
    const newDate = data.date ? new Date(data.date) : reservation.date;
    const newTimeBlockId = data.timeBlockId || reservation.timeBlockId;

    const conflict = await prisma.appointment.findFirst({
      where: {
        date: newDate,
        timeBlockId: newTimeBlockId,
        id: { not: parseInt(id, 10) },
      },
    });

    if (conflict) {
      throw new AppError(
        "Time block already booked for this date",
        StatusCodes.CONFLICT
      );
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: parseInt(id, 10) },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.timeBlockId && { timeBlockId: data.timeBlockId }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      timeBlock: true,
    },
  });

  return updated;
};

export const deleteReservation = async (id, userId) => {
  const reservation = await prisma.appointment.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!reservation) {
    throw new AppError("Reservation not found", StatusCodes.NOT_FOUND);
  }

  if (reservation.userId !== userId) {
    throw new AppError(
      "Access denied. You can only delete your own reservations",
      StatusCodes.FORBIDDEN
    );
  }

  await prisma.appointment.delete({
    where: { id: parseInt(id, 10) },
  });

  return reservation;
};