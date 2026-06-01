import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { connect, getStatus } from '../services/robotService.js';
import { DEBUG } from '../config/debug.js';

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
    } catch (e) {
      console.error('[ConnectionContext] fetchStatus failed:', e?.message ?? e);
      setStatus((prev) => ({ ...prev, connection_state: 'error' }));
    }
  }, []);

  useEffect(() => {
    if (!DEBUG.autoConnect) return;
    connect({ robotType: DEBUG.robotType, networkInterface: DEBUG.networkInterface })
      .catch(() => { })
      .finally(() => fetchStatus());
  }, [fetchStatus]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!DEBUG.autoConnect) {
        setStatus(DEFAULT_STATUS);
        setIsLoading(false);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    setIsLoading(true);
    fetchStatus().finally(() => setIsLoading(false));
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

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
