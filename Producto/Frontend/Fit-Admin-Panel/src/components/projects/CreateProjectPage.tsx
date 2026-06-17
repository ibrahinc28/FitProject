import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { userService, type UserSummary } from '../../services/userService';

interface CreateProjectPageProps {
  onBack: () => void;
  onCreated: (projectId: string) => void;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onBack, onCreated }) => {
  const [supervisors, setSupervisors] = useState<UserSummary[]>([]);
  const [form, setForm] = useState({
    modelName: '',
    description: '',
    imageUrl: '',
    budget: '',
    supervisorId: '',
    supervisorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getSupervisors()
      .then(setSupervisors)
      .catch(() => { /* non-fatal: supervisor list empty */ });
  }, []);

  const handleSupervisorChange = (userId: string) => {
    const sup = supervisors.find(s => s.userId === userId);
    setForm(f => ({
      ...f,
      supervisorId: userId,
      supervisorName: sup?.fullName ?? '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelName.trim()) { setError('El nombre del proyecto es obligatorio'); return; }
    setSubmitting(true);
    setError('');
    try {
      const project = await projectService.createProject({
        modelName: form.modelName.trim(),
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        supervisorId: form.supervisorId || undefined,
        supervisorName: form.supervisorName || undefined,
      });
      onCreated(project.projectId);
    } catch {
      setError('No se pudo crear el proyecto. Verifica que los servicios estén corriendo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nuevo Proyecto</h2>
        <p className="text-gray-500 text-sm mt-1">Crea un proyecto y asígnale un supervisor de obra</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Nombre del proyecto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre del proyecto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.modelName}
            onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))}
            placeholder="Ej: Gimnasio Container 40ft — Zona Norte"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Detalles adicionales del proyecto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Presupuesto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Presupuesto (CLP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* URL de imagen */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">URL de imagen (opcional)</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Supervisor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Supervisor de obra</label>
          {supervisors.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No hay supervisores registrados aún</p>
          ) : (
            <select
              value={form.supervisorId}
              onChange={e => handleSupervisorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Sin asignar —</option>
              {supervisors.map(sup => (
                <option key={sup.userId} value={sup.userId}>
                  {sup.fullName} ({sup.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Creando...' : 'Crear proyecto'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
