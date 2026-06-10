import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR_OBRA: 'Supervisor de Obra',
  INVERSIONISTA: 'Inversionista',
  USUARIO_GENERAL: 'Usuario',
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">FitProject</span>
          </Link>

          {/* Nav links (solo ADMIN) */}
          {user?.role === 'ADMIN' && (
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">Proyectos</Link>
              <Link to="/admin/users" className="hover:text-blue-600 transition-colors">Usuarios</Link>
            </div>
          )}

          {/* Perfil + logout */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;