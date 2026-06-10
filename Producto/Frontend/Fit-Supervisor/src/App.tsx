import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthCallbackPage from './components/auth/AuthCallbackPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import ProjectList from './components/projects/ProjectList'
import ProjectDetail from './components/projects/ProjectDetail'
import EvidencePage from './components/evidence/EvidencePage'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#0a0a0a]">
    <Navbar />
    <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
  </div>
)

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthCallbackPage />} />
        <Route path="/unauthorized" element={
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-xl font-semibold mb-2">Acceso no autorizado</p>
              <p className="text-gray-500 text-sm">Esta aplicación es solo para supervisores de obra.</p>
            </div>
          </div>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><ProjectList /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <Layout><ProjectDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId/steps/:stepId/evidence" element={
          <ProtectedRoute>
            <Layout><EvidencePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
