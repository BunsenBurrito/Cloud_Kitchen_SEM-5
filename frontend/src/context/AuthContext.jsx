// Holds the signed-in admin. Only admin accounts can sign in.
import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (getToken())
      api.get('/auth/me').then((d) => setUser(d.user)).catch(logout).finally(() => setLoading(false));
    window.addEventListener('ck-logout', logout);
    return () => window.removeEventListener('ck-logout', logout);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
