export type UserRole = 'ADMIN' | 'SUPERVISOR_OBRA' | 'INVERSIONISTA' | 'USUARIO_GENERAL' | 'TRABAJADOR' | 'VENDEDOR';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AppUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialty?: string;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  specialty?: string;
}