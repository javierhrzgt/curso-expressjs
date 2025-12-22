import {
  createTimeBlockService,
  listReservationsService,
} from "#services/admin.service";
import { StatusCodes } from "http-status-codes";
import { AppError } from "#utils/error.util";

export const createTimeBlocks = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    const { startTime, endTime } = req.body;
    const newTimeBlock = await createTimeBlockService(startTime, endTime);
    res.status(StatusCodes.CREATED).json(newTimeBlock);
  } catch (error) {
    next(error);
  }
};

export const listReservations = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    const reservations = await listReservationsService();
    res.status(StatusCodes.OK).json(reservations);
  } catch (error) {
    next(error); // Tenías "es.status" (typo)
  }
};
