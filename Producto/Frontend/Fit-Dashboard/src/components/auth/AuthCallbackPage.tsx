import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { AuthUser } from '../../types/auth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userRaw = params.get('user')

    if (token && userRaw) {
      try {
        const user: AuthUser = JSON.parse(decodeURIComponent(userRaw))
        localStorage.setItem('fit_token', token)
        localStorage.setItem('fit_user', JSON.stringify(user))
        setUser(user)
      } catch {
        // token inválido → redirigir a login de Fit-Frontend
        window.location.href = 'http://localhost:3000/login'
        return
      }
    }

    navigate('/', { replace: true })
  }, [navigate, setUser])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-gray-400 text-lg animate-pulse">Iniciando sesión...</p>
    </div>
  )
}