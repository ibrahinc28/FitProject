import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAssignmentsByWorker } from '../../services/assignmentService'
import { getProjects } from '../../services/projectService'
import type { TaskAssignment } from '../../types/assignment'
import type { Project } from '../../types/project'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completada',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
  IN_PROGRESS: 'bg-blue-900/40 text-blue-400 border border-blue-700',
  DONE: 'bg-green-900/40 text-green-400 border border-green-700',
}

const WorkerDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getAssignmentsByWorker(user.userId),
      getProjects(),
    ])
      .then(([asgns, projs]) => {
        setAssignments(asgns)
        setProjects(projs)
      })
      .catch(() => setError('No se pudieron cargar las tareas. Verifica la conexión.'))
      .finally(() => setLoading(false))
  }, [user])

  const projectName = (projectId: string) =>
    projects.find(p => p.projectId === projectId)?.modelName ?? projectId

  const handleLogout = () => {
    logout()
    navigate('/unauthorized')
  }

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
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-red-800"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold">Mis tareas asignadas</h1>
          <p className="text-gray-400 text-sm mt-1">
            {assignments.length} tarea{assignments.length !== 1 ? 's' : ''} asignada{assignments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No tienes tareas asignadas por el momento.</p>
            <p className="text-gray-600 text-xs mt-1">El supervisor te asignará tareas pronto.</p>
          </div>
        )}

        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.assignmentId}
              className="bg-[#161616] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base truncate">{a.stepName}</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Proyecto: <span className="text-gray-300">{projectName(a.projectId)}</span>
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Asignada: {new Date(a.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>

              {a.status !== 'DONE' && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => navigate(`/worker/evidence/${a.projectId}/${a.stepId}`)}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Enviar evidencia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default WorkerDashboard
