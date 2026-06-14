import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { AuthUser } from '../../types/auth'

const AuthCallbackPage: React.FC = () => {
  const [params] = useSearchParams()
  const { setUserAndToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const userRaw = params.get('user')
    if (token && userRaw) {
      const user = JSON.parse(userRaw) as AuthUser
      if (user.role !== 'SUPERVISOR_OBRA' && user.role !== 'TRABAJADOR') {
        navigate('/unauthorized')
        return
      }
      setUserAndToken(user, token)
      navigate(user.role === 'TRABAJADOR' ? '/worker' : '/')
    } else {
      navigate('/unauthorized')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Autenticando...</div>
    </div>
  )
}

export default AuthCallbackPage
