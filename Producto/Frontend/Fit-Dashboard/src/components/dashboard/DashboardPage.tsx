import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { getKpis } from '../../services/dashboardService'
import type { DashboardKpiDTO } from '../../types/dashboard'
import KpiCard from './KpiCard'
import { useAuth } from '../../context/AuthContext'

const STATUS_COLORS = ['#3b82f6', '#22c55e', '#f59e0b']

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpiDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, logout } = useAuth()

  useEffect(() => {
    getKpis()
      .then(setKpis)
      .catch(() => setError('No se pudo cargar los KPIs. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400 text-lg animate-pulse">Cargando dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-2">Error al cargar</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const projectStatusData = [
    { name: 'Activos', value: kpis!.activeProjects },
    { name: 'Completados', value: kpis!.completedProjects },
    { name: 'Pendientes', value: kpis!.totalProjects - kpis!.activeProjects - kpis!.completedProjects },
  ].filter(d => d.value > 0)

  const evidenceData = [
    { name: 'Pendientes', cantidad: kpis!.pendingEvidences },
    { name: 'Aprobadas', cantidad: kpis!.approvedEvidences },
    { name: 'Rechazadas', cantidad: kpis!.rejectedEvidences },
  ]

  const progressData = kpis!.projectsProgress.map(p => ({
    name: p.modelName.length > 16 ? p.modelName.slice(0, 14) + '…' : p.modelName,
    progreso: p.overallProgress,
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <header className="bg-[#111] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">FitProject</h1>
          <p className="text-xs text-gray-500">Dashboard de Inversores</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white">{user?.fullName}</p>
            <p className="text-xs text-blue-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Total Proyectos" value={kpis!.totalProjects} color="blue" />
            <KpiCard title="Proyectos Activos" value={kpis!.activeProjects} color="green" />
            <KpiCard title="Proyectos Completos" value={kpis!.completedProjects} color="purple" />
            <KpiCard
              title="Progreso Promedio"
              value={`${kpis!.averageProgress.toFixed(1)}%`}
              color="yellow"
            />
          </div>
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie: project status */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Estado de Proyectos</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {projectStatusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar: evidence summary */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Evidencias por Estado</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={evidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Bar: progress per project */}
        <section className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Progreso por Proyecto</h3>
          {progressData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No hay proyectos registrados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={progressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} unit="%" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Progreso']}
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                />
                <Bar dataKey="progreso" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Project timeline table */}
        <section className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Detalle de Proyectos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="text-left py-2 pr-4">Proyecto</th>
                  <th className="text-right py-2 pr-4">Pasos</th>
                  <th className="text-right py-2 pr-4">Progreso</th>
                  <th className="text-left py-2">Inicio</th>
                </tr>
              </thead>
              <tbody>
                {kpis!.projectsProgress.map(p => (
                  <tr key={p.projectId} className="border-b border-gray-900 hover:bg-[#1a1a1a]">
                    <td className="py-2.5 pr-4 text-white">{p.modelName}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-400">{p.stepsCompleted}/{p.totalSteps}</td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className={`font-semibold ${p.overallProgress >= 80 ? 'text-green-400' : p.overallProgress >= 40 ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {p.overallProgress.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}