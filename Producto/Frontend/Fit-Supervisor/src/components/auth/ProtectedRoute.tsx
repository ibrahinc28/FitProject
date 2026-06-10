import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ADMIN_LOGIN = import.meta.env.VITE_ADMIN_PANEL_URL ?? 'http://localhost:3000'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    window.location.href = ADMIN_LOGIN
    return null
  }

  if (user?.role !== 'SUPERVISOR_OBRA') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
