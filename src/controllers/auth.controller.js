import { registerUser, loginUser } from "#services/auth.service";
import { StatusCodes } from "http-status-codes";

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    await registerUser(email, password, name);
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "User registered Successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    return res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    next(error);
  }
};

export { register, login };
