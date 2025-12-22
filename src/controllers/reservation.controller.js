import { StatusCodes } from "http-status-codes";
import { AppError } from "#utils/error.util";
import * as reservationService from "#services/reservation.service";

export const createReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.createReservation(
      req.body,
      req.user.id // ID del usuario autenticado
    );
    res.status(StatusCodes.CREATED).json(reservation);
  } catch (error) {
    next(error);
  }
};

export const getReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservation(
      req.params.id,
      req.user.id
    );

    if (!reservation) {
      throw new AppError("Reservation not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json(reservation);
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservation(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!reservation) {
      throw new AppError("Reservation not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json(reservation);
  } catch (error) {
    next(error);
  }
};

export const deleteReservation = async (req, res, next) => {
  try {
    const result = await reservationService.deleteReservation(
      req.params.id,
      req.user.id
    );

    if (!result) {
      throw new AppError("Reservation not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};
