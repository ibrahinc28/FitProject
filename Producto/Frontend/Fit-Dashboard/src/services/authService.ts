import api from './api'
import type { LoginRequest, LoginResponse, AuthUser } from '../types/auth'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  localStorage.setItem('fit_token', res.data.token)
  localStorage.setItem('fit_user', JSON.stringify({
    userId: res.data.userId,
    email: res.data.email,
    fullName: res.data.fullName,
    role: res.data.role,
  } satisfies AuthUser))
  return res.data
}

export function logout(): void {
  localStorage.removeItem('fit_token')
  localStorage.removeItem('fit_user')
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('fit_user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}