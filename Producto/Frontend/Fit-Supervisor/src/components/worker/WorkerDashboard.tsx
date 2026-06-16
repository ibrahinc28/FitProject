import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEvidenceByWorker, workerSubmitEvidence } from '../../services/evidenceService'
import { getProjects } from '../../services/projectService'
import { uploadImage } from '../../services/cloudinaryService'
import type { Evidence } from '../../types/evidence'
import type { Project } from '../../types/project'

const isAwaitingWorker = (ev: Evidence) =>
  !!ev.assignedWorkerId && (!ev.evidenceUrl || ev.evidenceUrl === '')

const getStatusBadge = (ev: Evidence): string => {
  if (isAwaitingWorker(ev)) return 'bg-blue-900/40 text-blue-300 border-blue-700'
  const map: Record<string, string> = {
    PENDING:  'bg-yellow-900/40 text-yellow-400 border-yellow-700',
    APPROVED: 'bg-green-900/40 text-green-400 border-green-700',
    REJECTED: 'bg-red-900/40 text-red-400 border-red-700',
  }
  return map[ev.status] ?? map.PENDING
}

const getStatusLabel = (ev: Evidence): string => {
  if (isAwaitingWorker(ev)) return 'Pendiente'
  const map: Record<string, string> = {
    PENDING:  'En revisión',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
  }
  return map[ev.status] ?? ev.status
}

const WorkerDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Per-card upload state
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadDesc, setUploadDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cardError, setCardError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getEvidenceByWorker(user.userId),
      getProjects(),
    ])
      .then(([evs, projs]) => {
        setEvidences(evs)
        setProjects(projs)
      })
      .catch(() => setError('No se pudieron cargar las tareas. Verifica la conexión.'))
      .finally(() => setLoading(false))
  }, [user])

  const projectName = (projectId: string) =>
    projects.find(p => p.projectId === projectId)?.modelName ?? 'Proyecto'

  const openUpload = (ev: Evidence) => {
    setUploadingId(ev.evidenceId)
    setUploadFile(null)
    setUploadPreview(null)
    setUploadDesc(ev.description || '')
    setCardError('')
  }

  const cancelUpload = () => {
    setUploadingId(null)
    setUploadFile(null)
    if (uploadPreview) URL.revokeObjectURL(uploadPreview)
    setUploadPreview(null)
    setUploadDesc('')
    setCardError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadPreview) URL.revokeObjectURL(uploadPreview)
    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (evidenceId: string) => {
    if (!uploadFile) { setCardError('Selecciona una imagen'); return }
    setSubmitting(true)
    setCardError('')
    try {
      const { url } = await uploadImage(uploadFile)
      const updated = await workerSubmitEvidence(evidenceId, url, uploadDesc)
      setEvidences(prev => prev.map(e => e.evidenceId === evidenceId ? updated : e))
      setSuccess('Evidencia enviada. El supervisor la revisará pronto.')
      cancelUpload()
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
      const plainMsg = (err as Error)?.message
      setCardError(axiosData?.message ?? axiosData?.error ?? plainMsg ?? 'Error al enviar la evidencia')
    } finally {
      setSubmitting(false)
    }
  }

  const awaiting = evidences.filter(isAwaitingWorker)
  const completed = evidences.filter(ev => !isAwaitingWorker(ev))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#161616] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FitProject</p>
            <p className="text-orange-400 text-xs">Panel de trabajador</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{user?.fullName}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout() }}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-red-800"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Global alerts */}
        {success && (
          <div className="mb-5 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm flex justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-2 text-green-600 hover:text-green-400">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-5 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Tareas pendientes ── */}
            <div className="mb-8">
              <h1 className="text-white text-xl font-bold mb-1">Mis tareas pendientes</h1>
              <p className="text-gray-500 text-sm mb-5">
                {awaiting.length === 0
                  ? 'No tienes tareas pendientes.'
                  : `${awaiting.length} tarea${awaiting.length !== 1 ? 's' : ''} esperando tu evidencia`}
              </p>

              {awaiting.length === 0 ? (
                <div className="text-center py-12 bg-[#161616] border border-gray-800 rounded-xl">
                  <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">El supervisor te asignará tareas pronto.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {awaiting.map(ev => (
                    <div key={ev.evidenceId}
                      className="bg-[#161616] border border-blue-800/50 rounded-xl overflow-hidden">
                      {/* Task header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-white font-semibold truncate">{ev.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              Proyecto: <span className="text-gray-300">{projectName(ev.projectId)}</span>
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(ev)}`}>
                            {getStatusLabel(ev)}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="text-gray-400 text-sm bg-[#111] rounded-lg px-3 py-2 mt-2">
                            {ev.description}
                          </p>
                        )}

                        {uploadingId !== ev.evidenceId && (
                          <button
                            onClick={() => openUpload(ev)}
                            className="mt-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
                          >
                            Subir mi evidencia
                          </button>
                        )}
                      </div>

                      {/* Inline upload form */}
                      {uploadingId === ev.evidenceId && (
                        <div className="border-t border-blue-800/40 bg-blue-900/10 p-5 space-y-3">
                          <p className="text-blue-300 text-sm font-semibold">Subir evidencia fotográfica</p>

                          {cardError && (
                            <div className="p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-xs">
                              {cardError}
                            </div>
                          )}

                          {/* Image picker */}
                          {!uploadPreview ? (
                            <button
                              type="button"
                              onClick={() => fileRefs.current[ev.evidenceId]?.click()}
                              className="w-full h-32 border-2 border-dashed border-blue-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm"
                            >
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                              Toca para seleccionar imagen
                            </button>
                          ) : (
                            <div className="relative rounded-xl overflow-hidden">
                              <img src={uploadPreview} alt="preview" className="w-full h-40 object-cover" />
                              <button
                                onClick={() => {
                                  setUploadFile(null)
                                  if (uploadPreview) URL.revokeObjectURL(uploadPreview)
                                  setUploadPreview(null)
                                }}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          <input
                            ref={el => { fileRefs.current[ev.evidenceId] = el }}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                          />

                          <textarea
                            value={uploadDesc}
                            onChange={e => setUploadDesc(e.target.value)}
                            rows={2}
                            placeholder="Describe brevemente lo que muestra la imagen..."
                            className="w-full px-3 py-2 bg-[#111] border border-blue-800/40 text-white rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => void handleSubmit(ev.evidenceId)}
                              disabled={submitting || !uploadFile}
                              className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                            >
                              {submitting && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              )}
                              {submitting ? 'Enviando...' : 'Enviar evidencia'}
                            </button>
                            <button
                              onClick={cancelUpload}
                              disabled={submitting}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Historial ── */}
            {completed.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                  Historial
                </h2>
                <div className="space-y-3">
                  {completed.map(ev => (
                    <div key={ev.evidenceId}
                      className="bg-[#161616] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                      {ev.evidenceUrl && (
                        <img
                          src={ev.evidenceUrl}
                          alt={ev.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-800"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{ev.name}</p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {projectName(ev.projectId)}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(ev)}`}>
                        {getStatusLabel(ev)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default WorkerDashboard
