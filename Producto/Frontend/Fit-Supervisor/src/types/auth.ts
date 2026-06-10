export interface AuthUser {
  userId: string
  email: string
  fullName: string
  role: string
}

export interface LoginResponse {
  token: string
  userId: string
  email: string
  fullName: string
  role: string
}
