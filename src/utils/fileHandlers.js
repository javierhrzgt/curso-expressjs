import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, "../data/users.json");

const readUsers = async () => {
  const data = await fs.readFile(usersFilePath, "utf-8");
  return JSON.parse(data);
};

const saveUsers = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

export { readUsers, saveUsers };
