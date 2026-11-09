import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.error('[Auth] Failed to restore session:', err);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await api.getMe();
          setUser(data.user);
          setProfile(data.profile);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const quickLogin = async (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@proserve.com', pass: 'admin123' },
      provider: { email: 'provider@proserve.com', pass: 'provider123' },
      customer: { email: 'customer@proserve.com', pass: 'customer123' },
    };
    await login(creds[role].email, creds[role].pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
