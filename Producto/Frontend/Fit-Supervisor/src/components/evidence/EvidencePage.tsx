import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvidenceByStep, submitEvidence } from '../../services/evidenceService'
import { uploadImage } from '../../services/cloudinaryService'
import type { Evidence } from '../../types/evidence'
import { useAuth } from '../../context/AuthContext'

const statusBadge: Record<string, string> = {
  PENDING:  'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  APPROVED: 'bg-green-900/40 text-green-400 border-green-700',
  REJECTED: 'bg-red-900/40 text-red-400 border-red-700',
}

const statusLabel: Record<string, string> = {
  PENDING:  'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
}

const EvidencePage: React.FC = () => {
  const { projectId, stepId } = useParams<{ projectId: string; stepId: string }>()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10 MB')
      return
    }
    setError('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    if (!form.name) {
      setForm((f) => ({ ...f, name: file.name.replace(/\.[^.]+$/, '') }))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!stepId || !projectId) return
    if (!selectedFile) {
      setError('Debes seleccionar una imagen')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      setUploadProgress('uploading')
      const { url } = await uploadImage(selectedFile)
      setUploadProgress('done')

      await submitEvidence({
        stepId,
        projectId,
        name: form.name,
        description: form.description,
        evidenceUrl: url,
        submittedBy: user?.fullName ?? user?.email ?? 'Supervisor',
      })

      setSuccess('Evidencia enviada correctamente. Pendiente de aprobación.')
      setForm({ name: '', description: '' })
      handleRemoveFile()
      setShowForm(false)
      setUploadProgress('idle')
      loadEvidence()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la evidencia'
      setError(msg)
      setUploadProgress('idle')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setForm({ name: '', description: '' })
    handleRemoveFile()
    setError('')
    setUploadProgress('idle')
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
          >
            + Nueva evidencia
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit() }} className="bg-[#161616] border border-gray-800 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-white font-semibold">Subir nueva evidencia</h2>

          {/* Selector de imagen */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Imagen de evidencia</label>
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
                <span className="text-sm font-medium">Toca para seleccionar o tomar foto</span>
                <span className="text-xs text-gray-600">JPG, PNG, WEBP — máx. 10 MB</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <img src={previewUrl} alt="preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
              placeholder="ej. Fundaciones sector norte"
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {uploadProgress === 'uploading' && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {uploadProgress === 'uploading' ? 'Subiendo imagen...' : submitting ? 'Enviando...' : 'Enviar evidencia'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
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
              {ev.evidenceUrl ? (
                <img
                  src={ev.evidenceUrl}
                  alt={ev.name}
                  className="w-full h-40 object-cover bg-gray-800"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-40 bg-gray-900 flex items-center justify-center text-gray-700">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                  </svg>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate">{ev.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${statusBadge[ev.status] ?? statusBadge.PENDING}`}>
                    {statusLabel[ev.status] ?? ev.status}
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
