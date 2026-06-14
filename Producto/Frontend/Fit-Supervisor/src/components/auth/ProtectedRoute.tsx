import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginPage from './LoginPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (user?.role === 'TRABAJADOR') {
    return <Navigate to="/worker" replace />
  }

  if (user?.role !== 'SUPERVISOR_OBRA') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
