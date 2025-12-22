import { Router } from "express";
import { authenticateToken } from "#middlewares/auth.middleware";
import * as appointmentController from "#controllers/appointment.controller"

const router = Router();

router.get(
  "/:id/appointments",
  authenticateToken,
  appointmentController.getUserAppointments
);

export default router;
