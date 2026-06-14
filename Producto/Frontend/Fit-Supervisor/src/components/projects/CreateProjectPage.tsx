import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createProject } from '../../services/projectService'
import { uploadImage } from '../../services/cloudinaryService'

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    modelName: '',
    description: '',
    budget: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP)')
      return
    }
    setError('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!form.modelName.trim()) return
    setLoading(true)
    setError('')

    try {
      let imageUrl: string | undefined

      if (selectedFile) {
        setUploadProgress('uploading')
        const result = await uploadImage(selectedFile)
        imageUrl = result.url
        setUploadProgress('done')
      }

      const project = await createProject({
        modelName: form.modelName.trim(),
        description: form.description.trim() || undefined,
        imageUrl,
        budget: form.budget ? parseFloat(form.budget) : undefined,
      })

      navigate(`/projects/${project.projectId}`)
    } catch {
      setError('No se pudo crear el proyecto. Verifica que el backend esté activo.')
      setUploadProgress('idle')
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || uploadProgress === 'uploading'

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Inicio
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold">Nuevo proyecto</span>
      </div>

      <div className="bg-[#161616] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Nuevo proyecto</h1>
            <p className="text-xs text-gray-500">El ID del contenedor se asigna automáticamente (CONT-XXX)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Imagen del contenedor */}
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Imagen del contenedor terminado
              <span className="text-gray-600 font-normal ml-1">(opcional)</span>
            </label>
            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="w-full h-36 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-400 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                </svg>
                <span className="text-sm">Seleccionar imagen de referencia</span>
                <span className="text-xs text-gray-600">JPG, PNG, WEBP</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <img src={previewUrl} alt="preview" className="w-full h-44 object-cover" />
                {uploadProgress === 'uploading' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-sm">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subiendo imagen...
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={busy}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition disabled:opacity-50"
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

          {/* Nombre del modelo */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Nombre del modelo <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={form.modelName}
              onChange={(e) => setForm({ ...form, modelName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
              placeholder="Ej: Gym Container Pro 40'"
              disabled={busy}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Descripción
              <span className="text-gray-600 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 transition-colors placeholder-gray-600 resize-none"
              placeholder="Describe el proyecto, ubicación, cliente u otros detalles..."
              disabled={busy}
            />
          </div>

          {/* Presupuesto */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Presupuesto (CLP)
              <span className="text-gray-600 font-normal ml-1">(opcional, editable después)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full pl-8 pr-3.5 py-2.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
                placeholder="0"
                disabled={busy}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={busy || !form.modelName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploadProgress === 'uploading' ? 'Subiendo imagen...' : 'Creando...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear proyecto
                </>
              )}
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-900/10 border border-blue-800/30 rounded-xl">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">¿Qué incluye un proyecto?</p>
            <ul className="text-blue-400/70 text-xs space-y-0.5">
              <li>• ID único de contenedor (CONT-001, CONT-002…)</li>
              <li>• Pasos de construcción predefinidos</li>
              <li>• Seguimiento de progreso por paso</li>
              <li>• Sistema de evidencias fotográficas</li>
              <li>• Flujo de aprobación supervisor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage
