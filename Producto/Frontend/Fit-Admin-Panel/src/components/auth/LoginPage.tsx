import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:3001'
const SUPERVISOR_URL = import.meta.env.VITE_SUPERVISOR_URL ?? 'http://localhost:3003'
const ECOMMERCE_URL = import.meta.env.VITE_ECOMMERCE_URL ?? 'http://localhost:3002'
const SUCURSAL_URL = import.meta.env.VITE_SUCURSAL_URL ?? 'http://localhost:3004'

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });

      if (data.role === 'INVERSIONISTA') {
        const user = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }
        const params = new URLSearchParams({
          token: data.token,
          user: JSON.stringify(user),
        })
        window.location.href = `${DASHBOARD_URL}/auth?${params.toString()}`
        return
      }

      if (data.role === 'SUPERVISOR_OBRA' || data.role === 'TRABAJADOR') {
        const user = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }
        const params = new URLSearchParams({
          token: data.token,
          user: JSON.stringify(user),
        })
        window.location.href = `${SUPERVISOR_URL}/auth?${params.toString()}`
        return
      }

      if (data.role === 'VENDEDOR') {
        const user = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }
        const params = new URLSearchParams({
          token: data.token,
          user: JSON.stringify(user),
        })
        window.location.href = `${SUCURSAL_URL}/auth?${params.toString()}`
        return
      }

      if (data.role === 'USUARIO_GENERAL') {
        window.location.href = ECOMMERCE_URL
        return
      }

      // ADMIN → app principal
      navigate('/');
    } catch {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">FitProject</h1>
          <p className="text-gray-400 mt-1">Acceso unificado por rol</p>
        </div>

        <div className="bg-[#161616] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222] border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="admin@fitproject.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222] border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Redirigiendo...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
              Credenciales de prueba
            </p>
            <div className="space-y-1.5 text-xs text-gray-400">
              {[
                ['Admin', 'admin@fitproject.com / Admin123!', '→ App gestión'],
                ['Supervisor', 'supervisor@fitproject.com / Super123!', '→ App gestión'],
                ['Inversor', 'inversor@fitproject.com / Invest123!', '→ Dashboard KPIs'],
              ].map(([rol, creds, dest]) => (
                <div key={rol} className="flex justify-between items-center">
                  <span className="text-gray-500 w-16">{rol}</span>
                  <span className="flex-1">{creds}</span>
                  <span className="text-blue-500 ml-2">{dest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;