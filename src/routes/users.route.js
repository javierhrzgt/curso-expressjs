import express from "express";
import { readUsers, saveUsers } from "#utils/fileHandlers";
import {
  validateName,
  validateEmail,
  validateIdIsNumber,
  validateIdExists,
  validateEmailExists,
  validateEmailExistsForOtherUser,
  findUserById,
} from "#utils/validators";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await readUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error con conexión de datos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const users = await readUsers();

    const user = findUserById(userId, users);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, name, email } = req.body;

    const errorName = validateName(name);
    if (errorName) {
      return res.status(400).json({ error: errorName });
    }

    const errorEmail = validateEmail(email);
    if (errorEmail) {
      return res.status(400).json({ error: errorEmail });
    }

    if (id === undefined || id === null) {
      return res.status(400).json({ error: "El ID es requerido" });
    }

    const errorIdType = validateIdIsNumber(id);
    if (errorIdType) {
      return res.status(400).json({ error: errorIdType });
    }

    const users = await readUsers();

    const errorId = validateIdExists(id, users);
    if (errorId) {
      return res.status(400).json({
        error: errorId,
      });
    }

    const errorEmailExiste = validateEmailExists(email, users);
    if (errorEmailExiste) {
      return res.status(400).json({
        error: errorEmailExiste,
      });
    }

    const newUser = { id, name, email };
    users.push(newUser);
    await saveUsers(users);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el nuevo usuario." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email } = req.body;

    const errorName = validateName(name);
    if (errorName) {
      return res.status(400).json({ error: errorName });
    }

    const errorEmail = validateEmail(email);
    if (errorEmail) {
      return res.status(400).json({ error: errorEmail });
    }

    const users = await readUsers();

    const user = findUserById(userId, users);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const errorEmailExists = validateEmailExistsForOtherUser(
      email,
      users,
      userId
    );
    if (errorEmailExists) {
      return res.status(400).json({ error: errorEmailExists });
    }

    const userIndex = users.findIndex((u) => u.id === userId);
    users[userIndex] = { id: userId, name, email };
    await saveUsers(users);

    res.status(200).json(users[userIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const users = await readUsers();

    const user = findUserById(userId, users);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const updateUsers = users.filter((u) => u.id !== userId);
    await saveUsers(updateUsers);
    res
      .status(200)
      .json({ message: "Usuario eliminado correctamente.", user: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el usuario." });
  }
});

export {router as usersRouter};
