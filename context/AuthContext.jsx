import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { login as loginService, logout as logoutService } from '../services/authService.js';
import { setOnUnauthorized } from '../services/httpClient.js';
import { clearToken, getToken } from '../utils/tokenStorage.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();

        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.exp && decoded.exp < Date.now() / 1000) {
            await clearToken();
          } else {
            setUser({ username: decoded.sub });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.log("Error restaurando sesión:", error);
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);


  // Cuando el httpClient recibe un 401, el token expiró o es inválido.
  // Delegamos la reacción aquí: limpiar el estado sin que ninguna pantalla
  // tenga que ocuparse de ello.
  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const data = await loginService({ identifier, password });
      const decoded = jwtDecode(data.access_token);
      setUser({ username: decoded.sub });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[AuthContext] Error durante login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
