import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as logoutApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
      setProviderProfile(data.providerProfile);
    } catch {
      setUser(null);
      setProviderProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = (userData, providerData = null) => {
    setUser(userData);
    setProviderProfile(providerData);
  };

  const logout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    setUser(null);
    setProviderProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, providerProfile, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
