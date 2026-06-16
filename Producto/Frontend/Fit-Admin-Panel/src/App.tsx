import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import MainLayout from './components/layout/MainLayout'
import ProjectList from './components/projects/ProjectList'
import ProjectDetail from './components/projects/ProjectDetail'
import UserManagement from './components/admin/UserManagement'
import { useState } from 'react'
import './App.css'

function ProjectsView() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return selectedProjectId ? (
    <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
  ) : (
    <ProjectList onProjectSelect={setSelectedProjectId} />
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Supervisor y Admin — módulo de proyectos */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR_OBRA']}>
              <MainLayout><ProjectsView /></MainLayout>
            </ProtectedRoute>
          } />

          {/* Solo Admin — gestión de usuarios */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout><UserManagement /></MainLayout>
            </ProtectedRoute>
          } />

          {/* Sin permisos */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso denegado</h1>
                <p className="text-gray-500 mb-4">No tienes permiso para ver esta página.</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('fit_token')
                    localStorage.removeItem('fit_user')
                    window.location.href = '/login'
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Volver al login
                </button>
              </div>
            </div>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App