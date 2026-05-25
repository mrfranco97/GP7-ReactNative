import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getStatus } from '../services/robotService.js';

const POLL_INTERVAL_MS = 30_000;

const DEFAULT_STATUS = {
  connection_state: 'disconnected',
  robot_type: null,
  network_interface: null,
  connected_at: null,
  last_error: null,
};

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  // useRef porque el ID del intervalo no necesita provocar re-renders
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus(data);
    } catch {
      // Si falla (red caída, timeout) marcamos error sin borrar el tipo de robot
      // previo, ya que puede ser un problema temporal de conectividad.
      setStatus((prev) => ({ ...prev, connection_state: 'error' }));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      // Al cerrar sesión limpiamos el estado y detenemos el polling
      setStatus(DEFAULT_STATUS);
      clearInterval(intervalRef.current);
      return;
    }

    // Consulta inmediata al autenticarse
    setIsLoading(true);
    fetchStatus().finally(() => setIsLoading(false));

    // Polling cada POLL_INTERVAL_MS
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    // Cleanup: si isAuthenticated cambia o el componente se desmonta,
    // cancelamos el intervalo para no generar memory leaks ni peticiones huérfanas
    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, fetchStatus]);

  return (
    <ConnectionContext.Provider value={{ status, isLoading, refresh: fetchStatus }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection debe usarse dentro de <ConnectionProvider>');
  return ctx;
}
