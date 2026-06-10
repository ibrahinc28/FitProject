import React from 'react'
import { useAuth } from '../../context/AuthContext'

const ADMIN_LOGIN = import.meta.env.VITE_ADMIN_PANEL_URL ?? 'http://localhost:3000'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = ADMIN_LOGIN
  }

  return (
    <nav className="bg-[#111] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg">FitProject</span>
        <span className="text-emerald-400 text-sm font-medium">Sucursal Virtual</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{user?.fullName}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}

export default Navbar