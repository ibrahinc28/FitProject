import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login, storeUser } from '../../services/authService'

const LoginPage: React.FC = () => {
  const { setUserAndToken } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      const user = {
        userId:   res.userId,
        email:    res.email,
        fullName: res.fullName,
        role:     res.role,
      }
      storeUser(user, res.token)
      setUserAndToken(user, res.token)
      if (res.role === 'TRABAJADOR') {
        navigate('/worker')
      } else if (res.role !== 'SUPERVISOR_OBRA') {
        setError('Esta aplicación es solo para supervisores y trabajadores.')
      }
    } catch {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">FitProject</p>
            <p className="text-orange-400 text-xs font-medium">Supervisor de Obra</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-gray-800 rounded-2xl p-6">
          <h1 className="text-white font-bold text-xl mb-1">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-6">Acceso exclusivo para supervisores</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
                placeholder="supervisor@fitproject.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Credenciales de prueba: supervisor@fitproject.com
        </p>
      </div>
    </div>
  )
}

export default LoginPage
