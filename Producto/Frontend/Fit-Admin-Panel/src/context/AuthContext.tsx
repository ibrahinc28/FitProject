import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const data = await authService.login(credentials);
    setUser({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};