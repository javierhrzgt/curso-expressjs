import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe contener al menos 3 caracteres").trim(),
  email: z.email("El correo ingresado es inválido").toLowerCase(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("El correo ingresado es inválido").toLowerCase(),
  password: z.string().min(1, "Password es requerido"),
});