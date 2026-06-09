import { getDatabase } from '../db/database.js';

const DEFAULT_LIMIT = 200;

// Inserta un comando. created_at se setea acá (epoch ms).
export async function recordCommand({ username, type, label, success, detail = null }) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO command_history (username, type, label, success, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, type, label, success ? 1 : 0, detail, Date.now()],
  );
}

// Devuelve las filas del usuario, más nuevas primero. success vuelve como boolean.
export async function getHistory(username, { limit = DEFAULT_LIMIT } = {}) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, username, type, label, success, detail, created_at
     FROM command_history
     WHERE username = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
    [username, limit],
  );
  return rows.map((row) => ({ ...row, success: row.success === 1 }));
}

export async function clearHistory(username) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM command_history WHERE username = ?', [username]);
}
