import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../../services/projectService'
import type { Project } from '../../types/project'

const statusLabel: Record<string, { text: string; cls: string }> = {
  ACTIVE:    { text: 'Activo',     cls: 'bg-green-900/50 text-green-400 border-green-700' },
  COMPLETED: { text: 'Completado', cls: 'bg-blue-900/50 text-blue-400 border-blue-700'   },
  PAUSED:    { text: 'Pausado',    cls: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError('No se pudieron cargar los proyectos'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">{error}</div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mis Proyectos</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const s = statusLabel[p.status] ?? statusLabel.ACTIVE
          return (
            <Link
              key={p.projectId}
              to={`/projects/${p.projectId}`}
              className="block bg-[#161616] border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-white font-semibold group-hover:text-orange-400 transition">{p.modelName}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${s.cls}`}>{s.text}</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{p.clientName}</p>
              <p className="text-xs text-gray-500 mb-4">{p.location}</p>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Progreso general</span>
                  <span className="text-orange-400 font-medium">{p.overallProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${p.overallProgress}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectList
