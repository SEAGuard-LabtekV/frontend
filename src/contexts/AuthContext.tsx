import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken as saveToken, clearToken as removeToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  guestLogin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (e) {
          removeToken();
          localStorage.removeItem('user');
        }
      } else {
        const guestUser = localStorage.getItem('guestUser');
        if (guestUser) {
          setUser(JSON.parse(guestUser));
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    if (data.token) {
      saveToken(data.token);

      const loggedUser = {
        id: data.user?.id || '1',
        email,
        name: data.user?.name || email.split('@')[0],
        isGuest: false
      };

      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.removeItem('guestUser'); // clear guest session
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.register({ name, email, password });
    if (data.token) {
      saveToken(data.token);

      const newUser = {
        id: data.user?.id || '1',
        email,
        name: data.user?.name || name,
        isGuest: false
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.removeItem('guestUser');
    }
  };

  const guestLogin = () => {
    const guestUser = { id: 'guest', email: '', name: 'Guest User', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    removeToken();
    localStorage.removeItem('user');
  };

  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('guestUser');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, guestLogin, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
