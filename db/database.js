import * as SQLite from 'expo-sqlite';

const DB_NAME = 'gp7.db';

// Singleton: la DB se abre y migra una sola vez por sesión de app.
let dbPromise = null;

async function initDatabase() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS command_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      success INTEGER NOT NULL,
      detail TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_history_user_time
      ON command_history (username, created_at DESC);
  `);
  return db;
}

export function getDatabase() {
  if (!dbPromise) {
    // Si la inicialización falla, limpiamos la promesa cacheada para permitir
    // reintentar en la próxima llamada (en vez de quedar rota toda la sesión).
    dbPromise = initDatabase().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}
