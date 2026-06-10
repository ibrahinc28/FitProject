import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvidenceByStep, submitEvidence } from '../../services/evidenceService'
import type { Evidence } from '../../types/evidence'
import { useAuth } from '../../context/AuthContext'

const statusBadge: Record<string, string> = {
  PENDING:  'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  APPROVED: 'bg-green-900/40 text-green-400 border-green-700',
  REJECTED: 'bg-red-900/40 text-red-400 border-red-700',
}

const EvidencePage: React.FC = () => {
  const { projectId, stepId } = useParams<{ projectId: string; stepId: string }>()
  const { user } = useAuth()
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', evidenceUrl: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadEvidence = () => {
    if (!stepId) return
    setLoading(true)
    getEvidenceByStep(stepId)
      .then(setEvidences)
      .catch(() => setError('No se pudieron cargar las evidencias'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvidence() }, [stepId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stepId || !projectId) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await submitEvidence({
        stepId,
        projectId,
        name: form.name,
        description: form.description,
        evidenceUrl: form.evidenceUrl,
        submittedBy: user?.fullName ?? user?.email ?? 'Supervisor',
      })
      setSuccess('Evidencia enviada correctamente. Pendiente de aprobación.')
      setForm({ name: '', description: '', evidenceUrl: '' })
      setShowForm(false)
      loadEvidence()
    } catch {
      setError('Error al enviar la evidencia. Verifica la URL de imagen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-white transition text-sm">
          ← Proyecto
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold">Evidencias</span>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">{success}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Evidencias del paso</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva evidencia'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#161616] border border-gray-800 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-white font-semibold">Subir nueva evidencia</h2>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre del archivo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
              placeholder="foto_obra_dia1.jpg"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 resize-none"
              placeholder="Describe qué muestra esta evidencia..."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">URL de imagen</label>
            <input
              type="url"
              value={form.evidenceUrl}
              onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
              placeholder="https://..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white text-sm font-semibold rounded-lg transition"
          >
            {submitting ? 'Enviando...' : 'Enviar evidencia'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : evidences.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay evidencias para este paso todavía.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidences.map((ev) => (
            <div key={ev.evidenceId} className="bg-[#161616] border border-gray-800 rounded-xl overflow-hidden">
              {ev.evidenceUrl && (
                <img
                  src={ev.evidenceUrl}
                  alt={ev.name}
                  className="w-full h-40 object-cover bg-gray-800"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate">{ev.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${statusBadge[ev.status] ?? statusBadge.PENDING}`}>
                    {ev.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{ev.description}</p>
                <p className="text-xs text-gray-600">Por: {ev.submittedBy}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EvidencePage
