import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      if (res.role !== 'INVERSIONISTA' && res.role !== 'ADMIN') {
        setError('No tienes acceso al dashboard de inversores.')
        return
      }
      setUser({ userId: res.userId, email: res.email, fullName: res.fullName, role: res.role })
      navigate('/')
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">FitProject</h1>
          <p className="text-gray-400 mt-2">Portal de Inversores</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-gray-800 rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 p-4 bg-[#111] border border-gray-800 rounded-xl text-sm text-gray-500">
          <p className="font-medium text-gray-400 mb-1">Demo:</p>
          <p>inversor@fitproject.com / Invest123!</p>
          <p>admin@fitproject.com / Admin123!</p>
        </div>
      </div>
    </div>
  )
}