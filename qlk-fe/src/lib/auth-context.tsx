'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthSession } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  sessionMessage: string | null;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'qlk_auth_session_v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 giờ = 1 ngày duy trì đăng nhập

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    // Khôi phục phiên đăng nhập từ localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        const now = Date.now();

        if (now >= session.expiresAt) {
          // Phiên đã quá 1 ngày
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          setToken(null);
          setSessionMessage('Phiên đăng nhập (1 ngày) đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.');
        } else {
          setUser(session.user);
          setToken(session.token);
        }
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await api.auth.login(username, password);
      const expiresAt = Date.now() + ONE_DAY_MS;

      const session: AuthSession = {
        token: result.token,
        user: result.user,
        expiresAt,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(result.user);
      setToken(result.token);
      setSessionMessage(null);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
    setSessionMessage(null);
  };

  const clearSessionMessage = () => setSessionMessage(null);

  const isAdmin = user?.roleCode === 'ADMIN' || user?.roleId === 1;
  const isManager = user?.roleCode === 'MANAGER' || user?.roleId === 2;
  const isStaff = user?.roleCode === 'STAFF' || user?.roleId === 3;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
        isManager,
        isStaff,
        sessionMessage,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
