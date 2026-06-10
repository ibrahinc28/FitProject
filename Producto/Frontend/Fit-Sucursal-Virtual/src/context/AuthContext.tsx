import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  setUserAndToken: (user: AuthUser, token: string) => void
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('fit_user')
    const t = localStorage.getItem('fit_token')
    if (u && t) { setUser(JSON.parse(u)); setToken(t) }
  }, [])

  const setUserAndToken = (u: AuthUser, t: string) => {
    localStorage.setItem('fit_user', JSON.stringify(u))
    localStorage.setItem('fit_token', t)
    setUser(u); setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('fit_user')
    localStorage.removeItem('fit_token')
    setUser(null); setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, setUserAndToken, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}