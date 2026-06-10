import React, { createContext, useContext, useState, useEffect } from 'react'
import { getStoredUser, getStoredToken, storeUser, clearSession } from '../services/authService'
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
    const storedUser = getStoredUser()
    const storedToken = getStoredToken()
    if (storedUser && storedToken) {
      setUser(storedUser)
      setToken(storedToken)
    }
  }, [])

  const setUserAndToken = (u: AuthUser, t: string) => {
    storeUser(u, t)
    setUser(u)
    setToken(t)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setToken(null)
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
