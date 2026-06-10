import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthCallbackPage from './components/auth/AuthCallbackPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import ModelList from './components/models/ModelList'
import SalesList from './components/sales/SalesList'
import NewSaleModal from './components/sales/NewSaleModal'
import type { GymModel } from './types/sales'

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'sales'>('models')
  const [selectedModel, setSelectedModel] = useState<GymModel | null>(null)
  const [refresh, setRefresh] = useState(0)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-6 bg-[#161616] border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'models' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Modelos
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'sales' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Ventas
          </button>
        </div>

        {activeTab === 'models' && (
          <ModelList key={refresh} onSelectModel={setSelectedModel} />
        )}
        {activeTab === 'sales' && <SalesList key={refresh} />}

        {selectedModel && (
          <NewSaleModal
            model={selectedModel}
            onClose={() => setSelectedModel(null)}
            onSuccess={() => { setRefresh(r => r + 1); setActiveTab('sales') }}
          />
        )}
      </main>
    </div>
  )
}

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthCallbackPage />} />
        <Route path="/unauthorized" element={
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-xl font-semibold mb-2">Acceso no autorizado</p>
              <p className="text-gray-500 text-sm">Esta aplicación es solo para vendedores.</p>
            </div>
          </div>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App