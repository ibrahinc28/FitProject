import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { AppUser, CreateUserRequest, UserRole } from '../../types/auth';

const ROLES: UserRole[] = ['ADMIN', 'SUPERVISOR_OBRA', 'INVERSIONISTA', 'USUARIO_GENERAL', 'TRABAJADOR'];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR_OBRA: 'Supervisor de Obra',
  INVERSIONISTA: 'Inversionista',
  USUARIO_GENERAL: 'Usuario General',
  TRABAJADOR: 'Trabajador',
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  SUPERVISOR_OBRA: 'bg-blue-100 text-blue-800',
  INVERSIONISTA: 'bg-green-100 text-green-800',
  USUARIO_GENERAL: 'bg-gray-100 text-gray-800',
  TRABAJADOR: 'bg-orange-100 text-orange-800',
};

const SPECIALTIES = [
  'Electricista',
  'Plomero',
  'Albañil',
  'Pintor',
  'Carpintero',
  'Soldador',
  'Instalador',
  'Otros',
];

const EMPTY_FORM: CreateUserRequest = {
  email: '', password: '', fullName: '', role: 'SUPERVISOR_OBRA', specialty: '',
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'workers'>('all');

  const fetchUsers = async () => {
    try {
      setUsers(await authService.getUsers());
    } catch {
      /* silently ignore — user sees stale list */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    setFormError('');
    setSaving(true);
    try {
      await authService.createUser(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown; status?: number }; message?: string }
      const status = axiosErr?.response?.status ?? 0
      const body = axiosErr?.response?.data
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body ?? '')
      if (status === 400 || bodyStr.includes('ya está') || bodyStr.includes('registrado')) {
        setFormError('El email ingresado ya está registrado. Usa otro email.')
      } else if (status === 0 || bodyStr.includes('Network')) {
        setFormError('No se pudo conectar con el servidor. Verifica que los servicios estén activos.')
      } else {
        setFormError(`Error ${status}: ${bodyStr || axiosErr?.message}`)
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await authService.updateRole(userId, role);
    await fetchUsers();
  };

  const handleToggle = async (userId: string) => {
    await authService.toggleActive(userId);
    await fetchUsers();
  };

  const displayed = activeTab === 'workers'
    ? users.filter(u => u.role === 'TRABAJADOR')
    : users;

  const workerCount = users.filter(u => u.role === 'TRABAJADOR').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} usuario{users.length !== 1 ? 's' : ''} · {workerCount} trabajador{workerCount !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(''); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Crear nuevo usuario</h3>
          {formError && (
            <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{formError}</p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); void handleCreate(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole, specialty: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            {/* Especialidad — solo para TRABAJADOR */}
            {form.role === 'TRABAJADOR' && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <select
                  value={form.specialty ?? ''}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Selecciona especialidad...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
              >
                {saving ? 'Guardando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todos ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'workers'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Trabajadores ({workerCount})
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {activeTab === 'workers' ? 'No hay trabajadores registrados aún.' : 'No hay usuarios.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
                {activeTab === 'workers' && (
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Especialidad</th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Creado</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((u) => (
                <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{u.fullName}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[u.role as UserRole] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  {activeTab === 'workers' && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                        {u.specialty ?? '—'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggle(u.userId)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                        u.active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
