import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject, updateProject } from '../../services/projectService'
import { uploadImage } from '../../services/cloudinaryService'
import {
  createAssignment,
  deleteAssignment,
  getAssignmentsByStep,
} from '../../services/assignmentService'
import { createStep, renameStep } from '../../services/stepService'
import type { Project, ConstructionStep } from '../../types/project'
import type { TaskAssignment } from '../../types/assignment'
import api from '../../services/api'

interface Worker { userId: string; fullName: string; specialty?: string }

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

// ── StepCard ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: ConstructionStep
  projectId: string
  workers: Worker[]
}

const StepCard: React.FC<StepCardProps> = ({ step, projectId, workers }) => {
  const done = step.stepStatus
  const pct  = step.progressValue

  const [showAssign, setShowAssign]         = useState(false)
  const [assignments, setAssignments]       = useState<TaskAssignment[]>([])
  const [loadingAssign, setLoadingAssign]   = useState(false)
  const [selectedWorker, setSelectedWorker] = useState('')
  const [saving, setSaving]                 = useState(false)
  const [assignError, setAssignError]       = useState('')

  const loadAssignments = () => {
    setLoadingAssign(true)
    getAssignmentsByStep(step.stepId)
      .then(setAssignments)
      .catch(() => setAssignError('No se pudieron cargar las asignaciones'))
      .finally(() => setLoadingAssign(false))
  }

  const toggleAssign = () => {
    if (!showAssign) loadAssignments()
    setShowAssign(v => !v)
    setAssignError('')
  }

  const handleAssign = async () => {
    if (!selectedWorker) return
    const worker = workers.find(w => w.userId === selectedWorker)
    if (!worker) return
    setSaving(true)
    setAssignError('')
    try {
      const a = await createAssignment({
        workerId: worker.userId,
        workerName: worker.fullName,
        stepId: step.stepId,
      })
      setAssignments(prev => [...prev, a])
      setSelectedWorker('')
    } catch {
      setAssignError('No se pudo asignar. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId)
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId))
    } catch {
      setAssignError('No se pudo quitar la asignación.')
    }
  }

  const assignedIds = new Set(assignments.map(a => a.workerId))
  const availableWorkers = workers.filter(w => !assignedIds.has(w.userId))

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
      {/* Step header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{done ? '✅' : pct > 0 ? '🔨' : '⏳'}</span>
          <span className="text-white font-medium text-sm truncate">{step.stepName}</span>
        </div>
        <span className={`ml-2 flex-shrink-0 text-sm font-semibold ${
          done ? 'text-green-400' : pct > 0 ? 'text-orange-400' : 'text-gray-500'
        }`}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between">
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

        <button
          onClick={toggleAssign}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Trabajadores
        </button>
      </div>

      {/* Assignment panel */}
      {showAssign && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {assignError && (
            <p className="text-red-400 text-xs mb-2">{assignError}</p>
          )}

          {loadingAssign ? (
            <div className="flex justify-center py-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Current assignments */}
              {assignments.length > 0 && (
                <div className="mb-2 space-y-1">
                  {assignments.map(a => (
                    <div key={a.assignmentId} className="flex items-center justify-between bg-blue-900/20 border border-blue-800/40 rounded px-2 py-1">
                      <span className="text-blue-300 text-xs font-medium">{a.workerName}</span>
                      <button
                        onClick={() => handleRemove(a.assignmentId)}
                        className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                        title="Quitar asignación"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Assign new worker */}
              {availableWorkers.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedWorker}
                    onChange={e => setSelectedWorker(e.target.value)}
                    className="flex-1 bg-[#111] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar trabajador...</option>
                    {availableWorkers.map(w => (
                      <option key={w.userId} value={w.userId}>
                        {w.fullName}{w.specialty ? ` (${w.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => void handleAssign()}
                    disabled={!selectedWorker || saving}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded transition-colors"
                  >
                    {saving ? '...' : 'Asignar'}
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 text-xs">
                  {workers.length === 0
                    ? 'No hay trabajadores registrados.'
                    : 'Todos los trabajadores ya están asignados.'}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── ProjectDetail ────────────────────────────────────────────────────────────

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [project, setProject] = useState<Project | null>(null)
  const [workers, setWorkers]   = useState<Worker[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [actionError, setActionError] = useState('')

  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput]     = useState('')
  const [savingBudget, setSavingBudget]   = useState(false)

  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!projectId) return
    Promise.all([
      getProject(projectId),
      api.get<Worker[]>('/admin/users/workers').then(r => r.data).catch(() => []),
    ])
      .then(([p, ws]) => {
        setProject(p)
        setBudgetInput(String(p.budget ?? ''))
        setWorkers(ws)
      })
      .catch(() => setError('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [projectId])

  const saveBudget = async () => {
    if (!projectId || !project) return
    setSavingBudget(true)
    setActionError('')
    try {
      const updated = await updateProject(projectId, {
        budget: budgetInput ? parseFloat(budgetInput) : undefined,
      })
      setProject(updated)
      setEditingBudget(false)
    } catch {
      setActionError('No se pudo actualizar el presupuesto')
    } finally {
      setSavingBudget(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return
    setUploadingImage(true)
    setActionError('')
    try {
      const { url } = await uploadImage(file)
      const updated = await updateProject(projectId, { imageUrl: url })
      setProject(updated)
    } catch {
      setActionError('No se pudo actualizar la imagen')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepName, setEditingStepName] = useState('')
  const [savingStepName, setSavingStepName] = useState(false)

  const [addingStep, setAddingStep] = useState(false)
  const [newStepName, setNewStepName] = useState('')
  const [savingNewStep, setSavingNewStep] = useState(false)

  const handleRenameStep = async (stepId: string) => {
    if (!editingStepName.trim()) return
    setSavingStepName(true)
    setActionError('')
    try {
      const updated = await renameStep(stepId, editingStepName.trim())
      setProject(prev => prev ? {
        ...prev,
        constructionSteps: prev.constructionSteps?.map(s =>
          s.stepId === stepId ? { ...s, stepName: updated.stepName } : s
        )
      } : prev)
      setEditingStepId(null)
    } catch {
      setActionError('No se pudo renombrar el paso')
    } finally {
      setSavingStepName(false)
    }
  }

  const handleAddStep = async () => {
    if (!projectId || !newStepName.trim()) return
    setSavingNewStep(true)
    setActionError('')
    try {
      const step = await createStep(projectId, newStepName.trim())
      setProject(prev => prev ? {
        ...prev,
        constructionSteps: [...(prev.constructionSteps ?? []), step as unknown as ConstructionStep]
      } : prev)
      setNewStepName('')
      setAddingStep(false)
    } catch {
      setActionError('No se pudo agregar el paso')
    } finally {
      setSavingNewStep(false)
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

      {/* Error de acción inline (no reemplaza la página) */}
      {actionError && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="ml-3 text-red-500 hover:text-red-300 text-lg leading-none">✕</button>
        </div>
      )}

      {/* Pasos */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Pasos de construcción</h2>
        <button
          onClick={() => { setAddingStep(true); setNewStepName(''); setActionError('') }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo paso
        </button>
      </div>

      {/* Formulario nuevo paso */}
      {addingStep && (
        <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-lg p-4 mb-4 flex gap-2">
          <input
            autoFocus
            type="text"
            value={newStepName}
            onChange={e => setNewStepName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleAddStep(); if (e.key === 'Escape') setAddingStep(false) }}
            placeholder="Nombre del nuevo paso..."
            className="flex-1 px-3 py-2 bg-[#111] border border-gray-700 text-white text-sm rounded-lg outline-none focus:border-orange-500"
          />
          <button
            onClick={() => void handleAddStep()}
            disabled={savingNewStep || !newStepName.trim()}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition"
          >
            {savingNewStep ? '...' : 'Agregar'}
          </button>
          <button
            onClick={() => setAddingStep(false)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {steps.length === 0 ? (
        <p className="text-gray-500 text-sm">Este proyecto no tiene pasos de construcción.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map(step => (
            <div key={step.stepId}>
              {/* Edición de nombre del paso */}
              {editingStepId === step.stepId ? (
                <div className="flex gap-2 mb-1">
                  <input
                    autoFocus
                    type="text"
                    value={editingStepName}
                    onChange={e => setEditingStepName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') void handleRenameStep(step.stepId); if (e.key === 'Escape') setEditingStepId(null) }}
                    className="flex-1 px-2 py-1.5 bg-[#111] border border-orange-500 text-white text-sm rounded-lg outline-none"
                  />
                  <button
                    onClick={() => void handleRenameStep(step.stepId)}
                    disabled={savingStepName}
                    className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white text-xs rounded-lg transition"
                  >
                    {savingStepName ? '...' : 'OK'}
                  </button>
                  <button
                    onClick={() => setEditingStepId(null)}
                    className="px-2.5 py-1.5 bg-gray-800 text-gray-400 text-xs rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingStepId(step.stepId); setEditingStepName(step.stepName) }}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-400 transition mb-1 ml-1"
                  title="Editar nombre del paso"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Renombrar
                </button>
              )}
              <StepCard step={step} projectId={project.projectId} workers={workers} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
