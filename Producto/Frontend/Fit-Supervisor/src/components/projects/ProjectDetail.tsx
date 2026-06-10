import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../../services/projectService'
import type { Project, ConstructionStep } from '../../types/project'

const stepStatusIcon: Record<string, string> = {
  PENDING:     '⏳',
  IN_PROGRESS: '🔨',
  COMPLETED:   '✅',
}

interface StepCardProps {
  step: ConstructionStep
  projectId: string
}

const StepCard: React.FC<StepCardProps> = ({ step, projectId }) => (
  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span>{stepStatusIcon[step.status] ?? '⏳'}</span>
        <span className="text-white font-medium text-sm">{step.stepName}</span>
      </div>
      <span className="text-orange-400 text-sm font-semibold">{step.progress}%</span>
    </div>
    <p className="text-xs text-gray-500 mb-3">{step.description}</p>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
      <div
        className="h-full bg-orange-500 rounded-full transition-all"
        style={{ width: `${step.progress}%` }}
      />
    </div>
    <Link
      to={`/projects/${projectId}/steps/${step.stepId}/evidence`}
      className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Ver / Subir evidencias
    </Link>
  </div>
)

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return
    getProject(projectId)
      .then(setProject)
      .catch(() => setError('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error || !project) return (
    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">{error}</div>
  )

  const sorted = [...project.constructionSteps].sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-500 hover:text-white transition text-sm">← Proyectos</Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold">{project.modelName}</span>
      </div>

      <div className="bg-[#161616] border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.modelName}</h1>
            <p className="text-gray-400">{project.clientName} · {project.location}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-400">{project.overallProgress}%</p>
            <p className="text-xs text-gray-500">Progreso general</p>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Pasos de construcción</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((step) => (
          <StepCard key={step.stepId} step={step} projectId={project.projectId} />
        ))}
      </div>
    </div>
  )
}

export default ProjectDetail
