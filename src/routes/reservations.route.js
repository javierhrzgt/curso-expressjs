import { Router } from "express";
import * as reservationController from "#controllers/reservation.controller";
import { authenticateToken } from "#src/middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken, reservationController.createReservation);
router.get("/:id", authenticateToken, reservationController.getReservation);
router.put("/:id", authenticateToken, reservationController.updateReservation);
router.delete(
  "/:id",
  authenticateToken,
  reservationController.deleteReservation
);

export default router;
