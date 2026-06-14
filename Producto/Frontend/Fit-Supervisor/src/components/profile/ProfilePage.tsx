import React from 'react'
import { useAuth } from '../../context/AuthContext'

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="py-4 border-b border-gray-800 last:border-0">
    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
    <p className="text-white text-sm">{value}</p>
  </div>
)

const roleName: Record<string, string> = {
  SUPERVISOR_OBRA: 'Supervisor de Obra',
  ADMIN:           'Administrador',
  INVERSIONISTA:   'Inversionista',
  USUARIO_GENERAL: 'Usuario General',
  VENDEDOR:        'Vendedor',
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Información de tu cuenta</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-[#161616] border border-gray-800 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-500/15 border border-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-orange-400 text-xl font-bold">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
            <span className="inline-block text-xs px-2.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full font-medium mt-1">
              {roleName[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          <Field label="Nombre completo" value={user.fullName} />
          <Field label="Correo electrónico" value={user.email} />
          <Field label="Rol" value={roleName[user.role] ?? user.role} />
          <Field label="ID de usuario" value={user.userId} />
        </div>
      </div>

      {/* Info box */}
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-0.5">Gestión de cuenta</p>
            <p className="text-gray-600 text-xs">
              Para cambiar tu contraseña o datos personales, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
