import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { getStoredUser, logout as serviceLogout } from '../services/authService'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (u: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  function logout() {
    serviceLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}