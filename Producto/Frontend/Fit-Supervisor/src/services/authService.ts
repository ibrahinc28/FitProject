import type { AuthUser, LoginResponse } from '../types/auth'

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export const storeUser = (user: AuthUser, token: string) => {
  localStorage.setItem('fit_token', token)
  localStorage.setItem('fit_user', JSON.stringify(user))
}

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('fit_user')
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export const getStoredToken = (): string | null =>
  localStorage.getItem('fit_token')

export const clearSession = () => {
  localStorage.removeItem('fit_token')
  localStorage.removeItem('fit_user')
}
