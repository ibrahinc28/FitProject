import api from './api';
import type { LoginRequest, LoginResponse, AppUser, CreateUserRequest } from '../types/auth';

const TOKEN_KEY = 'fit_token';
const USER_KEY = 'fit_user';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    }));
    return data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),

  // Admin: gestión de usuarios
  getUsers: async (): Promise<AppUser[]> => {
    const { data } = await api.get<AppUser[]>('/api/v1/admin/users');
    return data;
  },

  createUser: async (req: CreateUserRequest): Promise<AppUser> => {
    const { data } = await api.post<AppUser>('/api/v1/admin/users', req);
    return data;
  },

  updateRole: async (userId: string, role: string): Promise<AppUser> => {
    const { data } = await api.patch<AppUser>(`/api/v1/admin/users/${userId}/role?role=${role}`);
    return data;
  },

  toggleActive: async (userId: string): Promise<AppUser> => {
    const { data } = await api.patch<AppUser>(`/api/v1/admin/users/${userId}/toggle`);
    return data;
  },
};