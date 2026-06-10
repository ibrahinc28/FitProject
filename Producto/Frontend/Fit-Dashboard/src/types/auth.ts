export type UserRole = 'ADMIN' | 'SUPERVISOR_OBRA' | 'INVERSIONISTA' | 'USUARIO_GENERAL'

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  email: string
  fullName: string
  role: UserRole
}