import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../../services/projectService'
import type { Project } from '../../types/project'

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`bg-[#161616] border rounded-xl p-5 ${color}`}>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
)

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const isComplete = project.overallProgress >= 100
  const totalSteps = project.constructionSteps?.length ?? 0
  const doneSteps = project.constructionSteps?.filter(s => s.stepStatus).length ?? 0

  return (
    <Link
      to={`/projects/${project.projectId}`}
      className="block bg-[#161616] border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors truncate">
            {project.modelName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {project.containerId && (
              <span className="text-xs font-mono text-orange-500">{project.containerId}</span>
            )}
            {project.createdAt && (
              <span className="text-xs text-gray-600">
                {new Date(project.createdAt).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
        </div>
        <span className={`ml-3 flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${
          isComplete
            ? 'bg-blue-900/40 text-blue-400 border-blue-700'
            : 'bg-green-900/40 text-green-400 border-green-700'
        }`}>
          {isComplete ? 'Completado' : 'Activo'}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">Progreso general</span>
          <span className="text-orange-400 font-semibold">{project.overallProgress}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>
      </div>

      {totalSteps > 0 && (
        <p className="text-xs text-gray-500">
          {doneSteps} de {totalSteps} pasos completados
        </p>
      )}
    </Link>
  )
}

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError('No se pudieron cargar los proyectos'))
      .finally(() => setLoading(false))
  }, [])

  const active = projects.filter(p => p.overallProgress < 100)
  const completed = projects.filter(p => p.overallProgress >= 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inicio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de tus proyectos de obra</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo proyecto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total" value={projects.length} color="border-gray-800" />
        <StatCard label="En progreso" value={active.length} color="border-green-800/50" />
        <StatCard label="Completados" value={completed.length} color="border-blue-800/50" />
      </div>

      {/* Active projects */}
      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Proyectos activos ({active.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map(p => <ProjectCard key={p.projectId} project={p} />)}
          </div>
        </section>
      )}

      {/* Completed projects */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Completados ({completed.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {completed.map(p => <ProjectCard key={p.projectId} project={p} />)}
          </div>
        </section>
      )}

      {projects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">Sin proyectos todavía</p>
          <p className="text-gray-600 text-sm mb-4">Crea tu primer proyecto para comenzar</p>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear proyecto
          </Link>
        </div>
      )}
    </div>
  )
}

export default HomePage
