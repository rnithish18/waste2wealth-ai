import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { User } from '@/types';
import { getSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    const cached = localStorage.getItem('w2w_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem('w2w_user');
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      localStorage.setItem('w2w_user', JSON.stringify(data.data.user));
      getSocket(data.data.user._id);
    } catch {
      setUser(null);
      localStorage.removeItem('w2w_user');
      localStorage.removeItem('w2w_token');
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
    refreshUser().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = (u: User, token: string) => {
    setUser(u);
    localStorage.setItem('w2w_user', JSON.stringify(u));
    localStorage.setItem('w2w_token', token);
    getSocket(u._id);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.data.user, data.token);
    return data.data.user as User;
  };

  const register = async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register', payload);
    persistSession(data.data.user, data.token);
    return data.data.user as User;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network failure on logout - clear local state regardless
    }
    setUser(null);
    localStorage.removeItem('w2w_user');
    localStorage.removeItem('w2w_token');
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { getErrorMessage };
