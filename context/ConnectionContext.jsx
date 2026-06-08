import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { connect, disconnect, getStatus } from '../services/robotService.js';

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
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      if (isMountedRef.current) setStatus(data);
    } catch (e) {
      console.error('[ConnectionContext] fetchStatus failed:', e?.message ?? e);
      if (isMountedRef.current) {
        setStatus((prev) => ({ ...prev, connection_state: 'error' }));
      }
    }
  }, []);

  // Consultar y mantener actualizado el estado del robot si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(DEFAULT_STATUS);
      setIsLoading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let alive = true;
    setIsLoading(true);
    fetchStatus().finally(() => { if (alive) setIsLoading(false); });
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      alive = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, fetchStatus]);

  const connectRobot = useCallback(async (robotType, networkInterface) => {
    setIsLoading(true);
    try {
      const data = await connect({ robotType, networkInterface });
      await fetchStatus();
      return data;
    } catch (e) {
      console.error('[ConnectionContext] connectRobot failed:', e?.message ?? e);
      const errMsg = e?.message ?? 'Error de conexión';
      setStatus((prev) => ({
        ...prev,
        connection_state: 'error',
        last_error: errMsg,
      }));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  const disconnectRobot = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await disconnect();
      await fetchStatus();
      return data;
    } catch (e) {
      console.error('[ConnectionContext] disconnectRobot failed:', e?.message ?? e);
      const errMsg = e?.message ?? 'Error al desconectar';
      setStatus((prev) => ({
        ...prev,
        connection_state: 'error',
        last_error: errMsg,
      }));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  return (
    <ConnectionContext.Provider
      value={{
        status,
        isLoading,
        refresh: fetchStatus,
        connectRobot,
        disconnectRobot,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection debe usarse dentro de <ConnectionProvider>');
  return ctx;
}
