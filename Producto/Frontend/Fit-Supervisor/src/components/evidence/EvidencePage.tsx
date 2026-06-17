import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEvidenceByStep,
  submitEvidence,
  workerSubmitEvidence,
  deleteEvidence,
} from '../../services/evidenceService'
import { uploadImage } from '../../services/cloudinaryService'
import { getWorkers, type Worker } from '../../services/workerService'
import type { Evidence } from '../../types/evidence'
import { useAuth } from '../../context/AuthContext'

// ── Status config ──────────────────────────────────────────────────────────────

// A task assigned to a worker but with no evidence uploaded yet
const isAwaitingWorker = (ev: { assignedWorkerId?: string; evidenceUrl?: string }) =>
  !!ev.assignedWorkerId && (!ev.evidenceUrl || ev.evidenceUrl === '')

const getStatusBadge = (ev: { status: string; assignedWorkerId?: string; evidenceUrl?: string }): string => {
  if (isAwaitingWorker(ev)) return 'bg-blue-900/40 text-blue-300 border-blue-700'
  const map: Record<string, string> = {
    PENDING:  'bg-yellow-900/40 text-yellow-400 border-yellow-700',
    APPROVED: 'bg-green-900/40 text-green-400 border-green-700',
    REJECTED: 'bg-red-900/40 text-red-400 border-red-700',
  }
  return map[ev.status] ?? map.PENDING
}

const getStatusLabel = (ev: { status: string; assignedWorkerId?: string; evidenceUrl?: string }): string => {
  if (isAwaitingWorker(ev)) return 'Pendiente'
  const map: Record<string, string> = {
    PENDING:  'En revisión',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
  }
  return map[ev.status] ?? ev.status
}

// ── Component ─────────────────────────────────────────────────────────────────

const EvidencePage: React.FC = () => {
  const { projectId, stepId } = useParams<{ projectId: string; stepId: string }>()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workerFileRef = useRef<HTMLInputElement>(null)

  // Treat unknown/loading role as supervisor to fail-safe: never show worker-only buttons
  const isSupervisor = !user || user.role === 'SUPERVISOR_OBRA' || user.role === 'ADMIN'

  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Create form ───────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', workerId: '', workerName: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle')

  // ── Worker task-completion ────────────────────────────────────────────────
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [workerFile, setWorkerFile] = useState<File | null>(null)
  const [workerPreview, setWorkerPreview] = useState<string | null>(null)
  const [workerDesc, setWorkerDesc] = useState('')
  const [completing, setCompleting] = useState(false)

  // ── Read-only detail modal ────────────────────────────────────────────────
  const [viewingEvidence, setViewingEvidence] = useState<Evidence | null>(null)

  // ── Secure delete modal ───────────────────────────────────────────────────
  const [deletingEvidence, setDeletingEvidence] = useState<Evidence | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ── Derived ───────────────────────────────────────────────────────────────
  const isAssignMode = !!form.workerId

  const loadEvidence = () => {
    if (!stepId) return
    setLoading(true)
    getEvidenceByStep(stepId)
      .then(setEvidences)
      .catch(() => setError('No se pudieron cargar las evidencias'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvidence() }, [stepId])
  useEffect(() => { getWorkers().then(setWorkers).catch(() => {}) }, [])

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return }
    if (file.size > 10 * 1024 * 1024) { setError('La imagen no puede superar 10 MB'); return }
    setError('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    if (!form.name) setForm(f => ({ ...f, name: file.name.replace(/\.[^.]+$/, '') }))
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit: Asignar tarea OR subir evidencia ──────────────────────────────
  const handleSubmit = async () => {
    if (!stepId || !projectId) return
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    if (!isAssignMode && !selectedFile && !isSupervisor) {
      setError('Debes seleccionar una imagen')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      let url = ''
      if (!isAssignMode && selectedFile) {
        setUploadProgress('uploading')
        const uploaded = await uploadImage(selectedFile)
        url = uploaded.url
        setUploadProgress('done')
      }
      await submitEvidence({
        stepId,
        projectId,
        name: form.name,
        description: form.description,
        evidenceUrl: url,
        submittedBy: user?.fullName || 'Supervisor',
        assignedWorkerId:   isAssignMode ? form.workerId   : undefined,
        assignedWorkerName: isAssignMode ? form.workerName : undefined,
      })
      setSuccess(
        isAssignMode
          ? `Tarea asignada a ${form.workerName}. Aparece como "Pendiente" hasta que suban la evidencia.`
          : 'Evidencia enviada correctamente.'
      )
      setForm({ name: '', description: '', workerId: '', workerName: '' })
      handleRemoveFile()
      setShowForm(false)
      setUploadProgress('idle')
      loadEvidence()
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
      const msg = data?.message ?? data?.error
      setError(msg ?? (isAssignMode ? 'No se pudo asignar la tarea' : 'Error al enviar la evidencia'))
      setUploadProgress('idle')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setForm({ name: '', description: '', workerId: '', workerName: '' })
    handleRemoveFile()
    setError('')
    setUploadProgress('idle')
  }

  // ── Worker file handlers ──────────────────────────────────────────────────
  const handleWorkerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setWorkerFile(file)
    setWorkerPreview(URL.createObjectURL(file))
  }

  const cancelWorkerComplete = () => {
    setCompletingId(null)
    setWorkerFile(null)
    if (workerPreview) URL.revokeObjectURL(workerPreview)
    setWorkerPreview(null)
    setWorkerDesc('')
  }

  const handleWorkerComplete = async (evidenceId: string) => {
    if (isSupervisor) return  // defense-in-depth: supervisors never submit worker evidence
    if (!workerFile) { setError('Debes seleccionar una imagen'); return }
    setCompleting(true)
    setError('')
    try {
      const { url } = await uploadImage(workerFile)
      const updated = await workerSubmitEvidence(evidenceId, url, workerDesc)
      setEvidences(prev => prev.map(e => e.evidenceId === evidenceId ? updated : e))
      setSuccess('Evidencia enviada. El supervisor recibirá una notificación para revisarla.')
      cancelWorkerComplete()
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
      setError(data?.message ?? data?.error ?? 'No se pudo enviar la evidencia')
    } finally {
      setCompleting(false)
    }
  }

  // ── Secure delete ─────────────────────────────────────────────────────────
  const openDeleteModal = (ev: Evidence) => {
    setDeletingEvidence(ev)
    setDeletePassword('')
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setDeletingEvidence(null)
    setDeletePassword('')
    setDeleteError('')
  }

  const handleDelete = async () => {
    if (!deletingEvidence || !user?.email) return
    if (!deletePassword.trim()) { setDeleteError('Ingresa tu contraseña'); return }
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteEvidence(deletingEvidence.evidenceId, user.email, deletePassword)
      setEvidences(prev => prev.filter(e => e.evidenceId !== deletingEvidence.evidenceId))
      setSuccess('Evidencia eliminada correctamente.')
      closeDeleteModal()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setDeleteError('Contraseña incorrecta. Vuelve a intentarlo.')
      } else {
        const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
        setDeleteError(data?.message ?? data?.error ?? 'Error al eliminar la evidencia')
      }
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-white transition text-sm">
          ← Proyecto
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold">Evidencias del paso</span>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-2 text-green-600 hover:text-green-400">✕</button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2 text-red-600 hover:text-red-400">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Evidencias del paso</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
          >
            + {isSupervisor ? 'Nueva tarea / evidencia' : 'Subir evidencia'}
          </button>
        )}
      </div>

      {/* ── CREATE FORM ── */}
      {showForm && (
        <form
          onSubmit={e => { e.preventDefault(); void handleSubmit() }}
          className="bg-[#161616] border border-gray-800 rounded-xl p-5 mb-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold">
              {isAssignMode ? '📋 Asignar tarea a trabajador' : '📷 Subir evidencia'}
            </h2>
            {isAssignMode && (
              <span className="text-xs px-2 py-0.5 bg-blue-900/40 border border-blue-700 text-blue-300 rounded-full">
                Quedará como Pendiente
              </span>
            )}
          </div>

          {/* Worker selector (supervisor only) */}
          {isSupervisor && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Asignar a trabajador
                <span className="ml-1 text-xs text-gray-500">(opcional — si seleccionas uno, se crea como tarea)</span>
              </label>
              <select
                value={form.workerId}
                onChange={e => {
                  const selectedWorker = workers.find(w => w.userId === e.target.value)
                  setForm(f => ({
                    ...f,
                    workerId: e.target.value,
                    workerName: selectedWorker?.fullName ?? '',
                  }))
                }}
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
              >
                <option value="">— Sin asignar (subo la evidencia yo) —</option>
                {workers.map(w => (
                  <option key={w.userId} value={w.userId}>
                    {w.fullName}{w.specialty ? ` · ${w.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image upload — hidden in assign mode */}
          {!isAssignMode && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Imagen de evidencia
                {isSupervisor && <span className="ml-2 text-xs text-gray-500">(opcional)</span>}
              </label>
              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-400 transition cursor-pointer"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium">Seleccionar o tomar foto</span>
                  <span className="text-xs text-gray-600">JPG, PNG, WEBP — máx. 10 MB</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="preview" className="w-full h-48 object-cover" />
                  <button type="button" onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition">
                    ✕
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {isAssignMode && (
            <div className="p-3 bg-blue-900/20 border border-blue-800/40 rounded-lg text-blue-300 text-xs">
              El trabajador seleccionado verá esta tarea como <strong>"Pendiente"</strong> y deberá subir la evidencia fotográfica para completarla. Tú recibirás una notificación cuando lo haga.
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {isAssignMode ? 'Nombre de la tarea' : 'Nombre de la evidencia'}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
              placeholder={isAssignMode ? 'ej. Instalar cableado eléctrico sector A' : 'ej. Fundaciones sector norte'}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {isAssignMode ? 'Instrucciones para el trabajador' : 'Descripción'}
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 resize-none"
              placeholder={isAssignMode
                ? 'Describe qué debe hacer el trabajador y qué evidencia debe subir...'
                : 'Describe qué muestra esta evidencia...'}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || (!isAssignMode && !selectedFile && !isSupervisor)}
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {uploadProgress === 'uploading' && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting
                ? (uploadProgress === 'uploading' ? 'Subiendo imagen...' : 'Guardando...')
                : isAssignMode
                  ? `Asignar a ${form.workerName}`
                  : 'Enviar evidencia'}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── EVIDENCE LIST ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : evidences.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No hay tareas ni evidencias para este paso todavía.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidences.map(ev => (
            <div key={ev.evidenceId}
              className={`bg-[#161616] border rounded-xl overflow-hidden ${
                isAwaitingWorker(ev) ? 'border-blue-800/50' : 'border-gray-800'
              }`}
            >
              {/* Image / placeholder — click opens read-only modal */}
              <button
                type="button"
                onClick={() => { if (!isAwaitingWorker(ev)) setViewingEvidence(ev) }}
                className={`w-full block text-left ${!isAwaitingWorker(ev) ? 'cursor-pointer hover:opacity-90 transition-opacity' : 'cursor-default'}`}
              >
                {isAwaitingWorker(ev) ? (
                  <div className="w-full h-32 bg-blue-900/10 border-b border-blue-800/30 flex flex-col items-center justify-center gap-1 text-blue-400/60">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">Esperando evidencia del trabajador</span>
                  </div>
                ) : ev.evidenceUrl ? (
                  <img src={ev.evidenceUrl} alt={ev.name}
                    className="w-full h-40 object-cover bg-gray-800"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="w-full h-40 bg-gray-900 flex items-center justify-center text-gray-700">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1 gap-2">
                  {/* Title — also opens modal */}
                  <button
                    type="button"
                    onClick={() => { if (!isAwaitingWorker(ev)) setViewingEvidence(ev) }}
                    className={`text-white text-sm font-medium leading-snug text-left ${!isAwaitingWorker(ev) ? 'hover:text-orange-400 transition-colors cursor-pointer' : ''}`}
                  >
                    {ev.name}
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(ev)}`}>
                      {getStatusLabel(ev)}
                    </span>
                    {/* Delete button — supervisor only */}
                    {isSupervisor && (
                      <button
                        type="button"
                        onClick={() => openDeleteModal(ev)}
                        title="Eliminar evidencia"
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {ev.description && (
                  <p className="text-xs text-gray-500 mb-1 line-clamp-2">{ev.description}</p>
                )}

                {isAwaitingWorker(ev) && ev.assignedWorkerName ? (
                  <p className="text-xs text-blue-400/80">
                    👤 Asignado a: <span className="font-medium">{ev.assignedWorkerName}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-600">Por: {ev.submittedBy}</p>
                )}

                {/* Worker "Complete task" button */}
                {isAwaitingWorker(ev) && !isSupervisor && (
                  <button
                    onClick={() => { setCompletingId(ev.evidenceId); setWorkerDesc(ev.description || '') }}
                    className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Subir mi evidencia
                  </button>
                )}
              </div>

              {/* Inline worker completion form */}
              {completingId === ev.evidenceId && !isSupervisor && (
                <div className="border-t border-blue-800/40 p-4 space-y-3 bg-blue-900/10">
                  <p className="text-xs text-blue-300 font-semibold">Completar tarea — sube tu evidencia</p>
                  {!workerPreview ? (
                    <button type="button" onClick={() => workerFileRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-blue-700 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-400 hover:text-blue-300 transition text-xs">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Toca para seleccionar imagen
                    </button>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden">
                      <img src={workerPreview} alt="preview" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => {
                          setWorkerFile(null)
                          if (workerPreview) URL.revokeObjectURL(workerPreview)
                          setWorkerPreview(null)
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✕
                      </button>
                    </div>
                  )}
                  <input ref={workerFileRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={handleWorkerFile} />
                  <textarea
                    value={workerDesc}
                    onChange={e => setWorkerDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe brevemente lo que muestra la imagen..."
                    className="w-full px-3 py-2 bg-[#111] border border-blue-800/40 text-white rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleWorkerComplete(ev.evidenceId)}
                      disabled={completing || !workerFile}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      {completing ? 'Enviando...' : 'Enviar evidencia'}
                    </button>
                    <button onClick={cancelWorkerComplete}
                      className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded-lg transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          READ-ONLY DETAIL MODAL
      ══════════════════════════════════════════════════════════ */}
      {viewingEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setViewingEvidence(null) }}
        >
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-white font-semibold">{viewingEvidence.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${getStatusBadge(viewingEvidence)}`}>
                  {getStatusLabel(viewingEvidence)}
                </span>
              </div>
              <button
                onClick={() => setViewingEvidence(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Full-size image */}
            {viewingEvidence.evidenceUrl ? (
              <img
                src={viewingEvidence.evidenceUrl}
                alt={viewingEvidence.name}
                className="w-full object-contain max-h-72 bg-gray-900"
              />
            ) : (
              <div className="w-full h-48 bg-gray-900 flex items-center justify-center text-gray-700">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                </svg>
              </div>
            )}

            {/* Read-only fields */}
            <div className="p-5 space-y-4">

              {/* Worker banner — shown when a worker completed this task */}
              {viewingEvidence.assignedWorkerName && viewingEvidence.evidenceUrl && (
                <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-800/40 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-800/50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400">Evidencia subida por trabajador</p>
                    <p className="text-sm text-blue-200 font-semibold">{viewingEvidence.assignedWorkerName}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Nombre de la tarea</p>
                <p className="text-sm text-gray-300 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800">
                  {viewingEvidence.name}
                </p>
              </div>

              {viewingEvidence.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {viewingEvidence.assignedWorkerName ? 'Descripción del trabajador' : 'Descripción'}
                  </p>
                  <p className="text-sm text-gray-300 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800 whitespace-pre-wrap leading-relaxed">
                    {viewingEvidence.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Asignado por</p>
                  <p className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800">
                    {viewingEvidence.submittedBy}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha de asignación</p>
                  <p className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800">
                    {viewingEvidence.createdAt
                      ? new Date(viewingEvidence.createdAt).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>

                {/* Show delivery date only when worker has submitted */}
                {viewingEvidence.assignedWorkerName && viewingEvidence.evidenceUrl && viewingEvidence.updatedAt && (
                  <div className="col-span-2">
                    <p className="text-xs text-blue-400 mb-1">Fecha de entrega del trabajador</p>
                    <p className="text-xs text-blue-300 bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-800/40">
                      {new Date(viewingEvidence.updatedAt).toLocaleDateString('es-CL', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 text-center pt-1">
                Vista de solo lectura — el contenido subido por el trabajador no puede modificarse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECURE DELETE MODAL
      ══════════════════════════════════════════════════════════ */}
      {deletingEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeDeleteModal() }}
        >
          <div className="bg-[#111] border border-red-900/50 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              {/* Warning icon */}
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <h2 className="text-white font-semibold text-center mb-1">Eliminar evidencia</h2>
              <p className="text-gray-400 text-sm text-center mb-1">
                Estás a punto de eliminar permanentemente:
              </p>
              <p className="text-orange-400 text-sm font-medium text-center mb-4">
                "{deletingEvidence.name}"
              </p>
              <p className="text-gray-500 text-xs text-center mb-5">
                Esta acción <strong className="text-gray-400">no se puede deshacer</strong>. Para confirmar, ingresa tu contraseña actual.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm text-center">
                  {deleteError}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm text-gray-300 mb-1">Tu contraseña</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') void handleDelete() }}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-3 py-2 bg-[#222] border border-gray-700 focus:border-red-500 text-white rounded-lg text-sm outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleting || !deletePassword.trim()}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {deleting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvidencePage
