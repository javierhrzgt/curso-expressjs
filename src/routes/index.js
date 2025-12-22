import { Router } from "express";
import authRouter from "#routes/auth.route";
import adminRouter from "#routes/admin.route";
import reservationsRouter from "#routes/reservations.route";
import appointmentsRouter from "#routes/appointments.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/reservations", reservationsRouter);
router.use("/users", appointmentsRouter);

export default router;
