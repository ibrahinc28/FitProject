import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:3001'
const ADMIN_LOGIN = import.meta.env.VITE_ADMIN_PANEL_URL ?? 'http://localhost:3000'

interface NavItemProps {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, badge }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    <span className="w-5 h-5 flex-shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
)

interface SidebarProps {
  pendingCount?: number
}

const Sidebar: React.FC<SidebarProps> = ({ pendingCount = 0 }) => {
  const { user, token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = ADMIN_LOGIN
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-[#111] border-r border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FitProject</p>
            <p className="text-orange-400 text-xs">Supervisor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem
          to="/"
          label="Inicio"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <NavItem
          to="/projects/new"
          label="Nuevo Proyecto"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
            </svg>
          }
        />
        <NavItem
          to="/notifications"
          label="Notificaciones"
          badge={pendingCount}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
        <NavItem
          to="/profile"
          label="Mi Perfil"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Divider */}
        <div className="pt-2 pb-1">
          <div className="border-t border-gray-800" />
        </div>

        {/* Dashboard — pasa el token actual para no pedir login de nuevo */}
        <button
          onClick={() => {
            if (!user || !token) return
            const params = new URLSearchParams({
              token,
              user: JSON.stringify({ userId: user.userId, email: user.email, fullName: user.fullName, role: user.role }),
            })
            window.open(`${DASHBOARD_URL}/auth?${params.toString()}`, '_blank')
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="w-5 h-5 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          <span className="flex-1">Dashboard KPIs</span>
          <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-400 text-xs font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'S'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
