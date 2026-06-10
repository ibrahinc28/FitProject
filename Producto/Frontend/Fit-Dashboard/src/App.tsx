import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import AuthCallbackPage from './components/auth/AuthCallbackPage'
import DashboardPage from './components/dashboard/DashboardPage'

function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-2xl font-bold">Acceso Denegado</p>
        <p className="text-gray-500 mt-2">No tienes permiso para ver esta página.</p>
        <a href="/login" className="text-blue-400 mt-4 inline-block hover:underline">Volver al login</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthCallbackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['INVERSIONISTA', 'ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}