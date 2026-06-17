import React, { useEffect, useState, useCallback } from 'react'
import { getPendingEvidences, approveEvidence, rejectEvidence } from '../../services/evidenceService'
import { useAuth } from '../../context/AuthContext'
import type { Evidence } from '../../types/evidence'

const statusBadge: Record<string, string> = {
  PENDING:  'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  APPROVED: 'bg-green-900/40 text-green-400 border-green-700',
  REJECTED: 'bg-red-900/40 text-red-400 border-red-700',
}

const statusLabel: Record<string, string> = {
  PENDING:  'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

interface EvidenceCardProps {
  evidence: Evidence
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  processing: string | null
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onApprove, onReject, processing }) => {
  const busy = processing === evidence.evidenceId

  return (
    <div className="bg-[#161616] border border-gray-800 rounded-xl overflow-hidden">
      {evidence.evidenceUrl && (
        <img
          src={evidence.evidenceUrl}
          alt={evidence.name}
          className="w-full h-44 object-cover bg-gray-900"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{evidence.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Enviado por: <span className="text-gray-400">{evidence.submittedBy}</span>
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${statusBadge[evidence.status] ?? statusBadge.PENDING}`}>
            {statusLabel[evidence.status] ?? evidence.status}
          </span>
        </div>

        {evidence.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{evidence.description}</p>
        )}

        <p className="text-xs text-gray-600 mb-4">
          {new Date(evidence.createdAt).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>

        {evidence.status === 'PENDING' && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(evidence.evidenceId)}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {busy ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Aprobar
            </button>
            <button
              onClick={() => onReject(evidence.evidenceId)}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {busy ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    getPendingEvidences()
      // Only show evidences where the worker already uploaded a photo (evidenceUrl is set).
      // Task assignments awaiting worker upload are excluded — they are not ready for supervisor review.
      .then(list => setEvidences(list.filter(e => !!e.evidenceUrl && e.evidenceUrl.trim() !== '')))
      .catch(() => setError('No se pudieron cargar las notificaciones'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async (evidenceId: string) => {
    setProcessing(evidenceId)
    try {
      await approveEvidence(evidenceId, user?.userId ?? '')
      showToast('Evidencia aprobada. El paso avanzó +20%.', 'ok')
      load()
    } catch {
      showToast('Error al aprobar. Intenta nuevamente.', 'err')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (evidenceId: string) => {
    setProcessing(evidenceId)
    try {
      await rejectEvidence(evidenceId, user?.userId ?? '')
      showToast('Evidencia rechazada.', 'ok')
      load()
    } catch {
      showToast('Error al rechazar. Intenta nuevamente.', 'err')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
          toast.type === 'ok'
            ? 'bg-green-900 border border-green-700 text-green-300'
            : 'bg-red-900 border border-red-700 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evidencias enviadas por trabajadores, pendientes de tu aprobación</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : evidences.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">Todo al día</p>
          <p className="text-gray-600 text-sm">No hay evidencias pendientes de aprobación</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            <span className="text-orange-400 font-semibold">{evidences.length}</span>{' '}
            {evidences.length === 1 ? 'evidencia pendiente' : 'evidencias pendientes'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidences.map(ev => (
              <EvidenceCard
                key={ev.evidenceId}
                evidence={ev}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationsPage
