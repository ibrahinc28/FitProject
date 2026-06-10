import React, { useState } from 'react'
import type { GymModel } from '../../types/sales'
import { createSale } from '../../services/salesService'

interface Props {
  model: GymModel
  onClose: () => void
  onSuccess: () => void
}

const NewSaleModal: React.FC<Props> = ({ model, onClose, onSuccess }) => {
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', unitId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createSale({
        unitId: form.unitId || model.modelId,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
      })
      onSuccess()
      onClose()
    } catch {
      setError('No se pudo registrar la venta. Verifica los datos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#161616] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">Nueva Venta</h2>
            <p className="text-gray-400 text-sm">{model.name} — ${model.price?.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl leading-none">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre del comprador</label>
            <input type="text" value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-emerald-500"
              placeholder="Juan García" required />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email del comprador</label>
            <input type="email" value={form.buyerEmail}
              onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-emerald-500"
              placeholder="juan@email.com" required />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">ID de unidad</label>
            <input type="text" value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-emerald-500"
              placeholder="UUID de la unidad disponible" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-semibold rounded-lg text-sm transition">
              {submitting ? 'Registrando...' : 'Confirmar venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewSaleModal