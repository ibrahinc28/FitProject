import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject, updateProject } from '../../services/projectService'
import { uploadImage } from '../../services/cloudinaryService'
import type { Project, ConstructionStep } from '../../types/project'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

interface StepCardProps {
  step: ConstructionStep
  projectId: string
}

const StepCard: React.FC<StepCardProps> = ({ step, projectId }) => {
  const done = step.stepStatus
  const pct = step.progressValue

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{done ? '✅' : pct > 0 ? '🔨' : '⏳'}</span>
          <span className="text-white font-medium text-sm truncate">{step.stepName}</span>
        </div>
        <span className={`ml-2 flex-shrink-0 text-sm font-semibold ${
          done ? 'text-green-400' : pct > 0 ? 'text-orange-400' : 'text-gray-500'
        }`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <Link
        to={`/projects/${projectId}/steps/${step.stepId}/evidence`}
        className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Ver / Subir evidencias
      </Link>
    </div>
  )
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!projectId) return
    getProject(projectId)
      .then((p) => { setProject(p); setBudgetInput(String(p.budget ?? '') )})
      .catch(() => setError('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [projectId])

  const saveBudget = async () => {
    if (!projectId || !project) return
    setSavingBudget(true)
    try {
      const updated = await updateProject(projectId, {
        budget: budgetInput ? parseFloat(budgetInput) : undefined,
      })
      setProject(updated)
      setEditingBudget(false)
    } catch {
      setError('No se pudo actualizar el presupuesto')
    } finally {
      setSavingBudget(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return
    setUploadingImage(true)
    try {
      const { url } = await uploadImage(file)
      const updated = await updateProject(projectId, { imageUrl: url })
      setProject(updated)
    } catch {
      setError('No se pudo actualizar la imagen')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error || !project) return (
    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">{error || 'Proyecto no encontrado'}</div>
  )

  const steps = [...(project.constructionSteps ?? [])]
  const doneSteps = steps.filter(s => s.stepStatus).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm">← Inicio</Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold truncate">{project.modelName}</span>
      </div>

      {/* Header card */}
      <div className="bg-[#161616] border border-gray-800 rounded-xl overflow-hidden mb-6">

        {/* Imagen del contenedor */}
        <div className="relative">
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.modelName} className="w-full h-52 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
              </svg>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs rounded-lg transition disabled:opacity-50"
          >
            {uploadingImage
              ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Subiendo...</>
              : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg> {project.imageUrl ? 'Cambiar imagen' : 'Agregar imagen'}</>
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="p-6">
          {/* Título + ContainerID */}
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-2xl font-bold text-white">{project.modelName}</h1>
            {project.containerId && (
              <span className="flex-shrink-0 ml-3 px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold rounded-lg">
                {project.containerId}
              </span>
            )}
          </div>

          {project.createdAt && (
            <p className="text-gray-500 text-xs mb-3">
              Creado: {new Date(project.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}

          {project.description && (
            <p className="text-gray-400 text-sm mb-4">{project.description}</p>
          )}

          {/* Presupuesto */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Presupuesto:</span>
            {editingBudget ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="pl-6 pr-2 py-1 bg-[#222] border border-gray-600 focus:border-orange-500 text-white text-sm rounded outline-none w-36"
                    autoFocus
                  />
                </div>
                <button onClick={() => void saveBudget()} disabled={savingBudget}
                  className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white text-xs rounded transition">
                  {savingBudget ? '...' : 'Guardar'}
                </button>
                <button onClick={() => { setEditingBudget(false); setBudgetInput(String(project.budget ?? '')) }}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded transition">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingBudget(true)}
                className="flex items-center gap-1.5 text-sm text-white hover:text-orange-400 transition group">
                <span>{project.budget ? fmt(project.budget) : <span className="text-gray-600 italic">Sin presupuesto</span>}</span>
                <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {/* Progreso general */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Progreso general</span>
            <span className="text-orange-400 font-bold text-lg">{project.overallProgress}%</span>
          </div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${project.overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{doneSteps} de {steps.length} pasos completados</p>
        </div>
      </div>

      {/* Pasos */}
      <h2 className="text-base font-semibold text-white mb-4">Pasos de construcción</h2>
      {steps.length === 0 ? (
        <p className="text-gray-500 text-sm">Este proyecto no tiene pasos de construcción.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map(step => (
            <StepCard key={step.stepId} step={step} projectId={project.projectId} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
