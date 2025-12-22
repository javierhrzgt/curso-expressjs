import { Router } from "express";
import {
  createTimeBlocks,
  listReservations,
} from "#controllers/admin.controller";
import { authenticateToken } from "#middlewares/auth.middleware";
import { authorize } from "#middlewares/authorize.middleware";

const router = Router();

router.post(
  "/time-blocks",
  authenticateToken,
  authorize("ADMIN"),
  createTimeBlocks
);

router.get(
  "/reservations",
  authenticateToken,
  authorize("ADMIN"),
  listReservations
);

export default router;
