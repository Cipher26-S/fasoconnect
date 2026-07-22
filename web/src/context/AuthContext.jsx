import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { getApiErrorMessage } from '../services/api.js';
import { tokenStorage } from '../utils/tokenStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState('');

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setBootstrapping(false);
      return;
    }

    try {
      const currentUser = await authService.me();
      setUser(currentUser);
    } catch {
      clearSession();
    } finally {
      setBootstrapping(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
    window.addEventListener('fasoconnect:unauthorized', clearSession);
    return () => window.removeEventListener('fasoconnect:unauthorized', clearSession);
  }, [clearSession, loadUser]);

  const login = useCallback(async ({ email, password }) => {
    setError('');
    try {
      const data = await authService.login({ email, password });
      tokenStorage.setTokens(data);
      setUser(data.user);
      return data.user;
    } catch (apiError) {
      const message = getApiErrorMessage(apiError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError('');
    try {
      const data = await authService.register(payload);
      tokenStorage.setTokens(data);
      setUser(data.user);
      return data.user;
    } catch (apiError) {
      const message = getApiErrorMessage(apiError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.getAccessToken()) await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, error, bootstrapping, isAuthenticated: Boolean(user), login, register, logout }),
    [user, error, bootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
