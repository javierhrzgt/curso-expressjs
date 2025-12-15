const validateName = (name) => {
  if (!name || name.length < 3) {
    return "El nombre debe contener al menos 3 caracteres.";
  }
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return "El correo ingresado es invalido.";
  }
  return null;
};

const validateIdIsNumber = (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    return "El ID debe ser un numero valido.";
  }
  return null;
};

const validateIdExists = (id, users) => {
  if (users.find((user) => user.id === id)) {
    return "El ID ya existe";
  }
  return null;
};

const validateEmailExists = (email, users) => {
  if (users.find((user) => user.email === email)) {
    return "El email ya existe";
  }
  return null;
};

const validateEmailExistsForOtherUser = (email, users, userId) => {
  if (users.find((user) => user.email === email && user.id !== userId)) {
    return "El email esta en uso por otro usuario.";
  }
  return null;
};

const findUserById = (userId, users) => {
  return users.find((u) => u.id === userId) || null;
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
