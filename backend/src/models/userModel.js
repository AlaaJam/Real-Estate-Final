import db from "../db.js";

export async function findUserByEmail(email) {
  return await db.get("SELECT * FROM users WHERE email = ?", [email]);
}

export async function findUserById(id) {
  return await db.get(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [id]
  );
}

export async function createUser({ name, email, password_hash }) {
  const result = await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password_hash]
  );
  return await findUserById(result.lastID);
}
