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
          setUser({ username: decoded.sub });
          setIsAuthenticated(true);
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
      if (data?.access_token) {
        // guardamos username u otra data si queremos persistirla
        setUser({ username: identifier });
        setIsAuthenticated(true);
      } else {
        throw new Error('Ocurrio un error inesperado. Por favor, intente mas tarde.');
      }
    } catch (error) {
      console.error('[AuthContext] Error durante login:', error);
      throw error;
    }
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
