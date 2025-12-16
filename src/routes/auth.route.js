import { Router } from "express";
import { register, login } from "#controllers/auth.controller";
import { registerSchema, loginSchema } from "#src/utils/schemas/auth.schema";
import { validate } from "#middlewares/validate.middleware";
import { authenticateToken } from "#src/middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.get("/protected-route", authenticateToken, (req, res) => {
  res.send("Esta es una ruta protegida");
});

export default router;
