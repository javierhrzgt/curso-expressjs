import { AppError } from "#utils/error.util";

const validateName = (name) => {
  if (!name || name.length < 3) {
    throw new AppError("El nombre debe contener al menos 3 caracteres.", 400);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    throw new AppError("El correo ingresado es invalido.", 400);
  }
};

const validateIdIsNumber = (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    throw new AppError("El ID debe ser un numero valido.", 400);
  }
};

const validateIdExists = (id, users) => {
  if (users.find((user) => user.id === id)) {
    throw new AppError("El ID ya existe", 409);
  }
};

const validateEmailExists = (email, users) => {
  if (users.find((user) => user.email === email)) {
    throw new AppError("El email ya existe", 409);
  }
};

const validateEmailExistsForOtherUser = (email, users, userId) => {
  if (users.find((user) => user.email === email && user.id !== userId)) {
    throw new AppError("El email esta en uso por otro usuario.", 409);
  }
};

const findUserById = (userId, users) => {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return user;
};

export {
  validateName,
  validateEmail,
  validateIdIsNumber,
  validateIdExists,
  validateEmailExists,
  validateEmailExistsForOtherUser,
  findUserById,
};
