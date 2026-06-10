import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return <>{children}</>
}