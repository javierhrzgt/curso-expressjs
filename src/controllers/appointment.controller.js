import * as appointmentService from "#services/appointment.service";
import { StatusCodes } from "http-status-codes";
import { AppError } from "#utils/error.util";

export const getUserAppointments = async (req, res, next) => {
  try {
    const requestedUserId = parseInt(req.params.id, 10);
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Validar que el ID sea válido
    if (isNaN(requestedUserId)) {
      throw new AppError("Invalid user ID", StatusCodes.BAD_REQUEST);
    }

    // Solo permite si es el mismo usuario o es ADMIN
    if (currentUserId !== requestedUserId && userRole !== "ADMIN") {
      throw new AppError(
        "Access denied. You can only view your own appointments",
        StatusCodes.FORBIDDEN
      );
    }

    const appointments = await appointmentService.getUserAppointments(
      requestedUserId
    );
    
    res.status(StatusCodes.OK).json(appointments);
  } catch (error) {
    next(error);
  }
};