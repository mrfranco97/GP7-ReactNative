import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { clearHistory, getHistory, recordCommand } from '../services/historyService.js';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!username) {
      setHistory([]);
      setError(false);
      return;
    }
    try {
      const rows = await getHistory(username);
      setHistory(rows);
      setError(false);
    } catch (e) {
      console.error('[HistoryContext] refresh failed:', e?.message ?? e);
      setError(true);
    }
  }, [username]);

  // Recargar cuando cambia el usuario (login / logout / restauración de sesión).
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Registrar un comando: prepend optimista + persistencia. Nunca rompe la UI.
  const logCommand = useCallback(
    async ({ type, label, success, detail = null }) => {
      if (!username) return;
      const optimistic = {
        id: `tmp-${Date.now()}-${Math.random()}`,
        username,
        type,
        label,
        success,
        detail,
        created_at: Date.now(),
      };
      setHistory((prev) => [optimistic, ...prev]);
      try {
        await recordCommand({ username, type, label, success, detail });
      } catch (e) {
        console.error('[HistoryContext] logCommand failed:', e?.message ?? e);
      } finally {
        // Reconciliar siempre: en éxito reemplaza el item optimista por las filas
        // reales; en fallo elimina el item optimista (la fila no se persistió).
        await refresh();
      }
    },
    [username, refresh],
  );

  const clear = useCallback(async () => {
    if (!username) return;
    try {
      await clearHistory(username);
      setHistory([]);
    } catch (e) {
      console.error('[HistoryContext] clear failed:', e?.message ?? e);
    }
  }, [username]);

  return (
    <HistoryContext.Provider value={{ history, error, logCommand, refresh, clear }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory debe usarse dentro de <HistoryProvider>');
  return ctx;
}
