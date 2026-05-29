import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken } from '../utils/tokenStorage.js';
import { login as loginService, logout as logoutService } from '../services/authService.js';
import { setOnUnauthorized } from '../services/httpClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // true mientras se comprueba el token persistido — evita el "flash" a Login
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) setUser({ username: 'usuario' });
      setIsLoading(false);
    };
    restoreSession();
  }, []);


  // Cuando el httpClient recibe un 401, el token expiró o es inválido.
  // Delegamos la reacción aquí: limpiar el estado sin que ninguna pantalla
  // tenga que ocuparse de ello.
  useEffect(() => {
    setOnUnauthorized(() => setIsAuthenticated(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    await loginService({ identifier, password });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
