import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthCallbackPage from './components/auth/AuthCallbackPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import HomePage from './components/home/HomePage'
import CreateProjectPage from './components/projects/CreateProjectPage'
import ProjectDetail from './components/projects/ProjectDetail'
import EvidencePage from './components/evidence/EvidencePage'
import NotificationsPage from './components/notifications/NotificationsPage'
import ProfilePage from './components/profile/ProfilePage'
import { getPendingEvidences } from './services/evidenceService'
import WorkerProtectedRoute from './components/auth/WorkerProtectedRoute'
import WorkerDashboard from './components/worker/WorkerDashboard'

const POLL_INTERVAL = 30_000

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchCount = () => {
      getPendingEvidences()
        .then(ev => setPendingCount(ev.length))
        .catch(() => { /* silent – backend may be offline */ })
    }
    fetchCount()
    const timer = setInterval(fetchCount, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthCallbackPage />} />
        <Route path="/unauthorized" element={
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-xl font-semibold mb-2">Acceso no autorizado</p>
              <p className="text-gray-500 text-sm">Esta aplicación es solo para supervisores de obra.</p>
            </div>
          </div>
        } />

        {/* Worker routes */}
        <Route path="/worker" element={
          <WorkerProtectedRoute>
            <WorkerDashboard />
          </WorkerProtectedRoute>
        } />
        <Route path="/worker/evidence/:projectId/:stepId" element={
          <WorkerProtectedRoute>
            <AppShell><EvidencePage /></AppShell>
          </WorkerProtectedRoute>
        } />

        {/* Protected (supervisor) */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppShell><HomePage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/projects/new" element={
          <ProtectedRoute>
            <AppShell><CreateProjectPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <AppShell><ProjectDetail /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId/steps/:stepId/evidence" element={
          <ProtectedRoute>
            <AppShell><EvidencePage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <AppShell><NotificationsPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppShell><ProfilePage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
