import React, { useEffect, useState } from 'react'
import type { SaleDTO } from '../../types/sales'
import { getAllSales } from '../../services/salesService'

const statusBadge: Record<string, string> = {
  CONFIRMED: 'bg-green-900/40 text-green-400 border-green-700',
  PENDING:   'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  CANCELLED: 'bg-red-900/40 text-red-400 border-red-700',
}

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<SaleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllSales()
      .then(setSales)
      .catch(() => setError('No se pudieron cargar las ventas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">{error}</div>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Ventas registradas</h2>
      {sales.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Sin ventas registradas todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left pb-3">Modelo</th>
                <th className="text-left pb-3">Comprador</th>
                <th className="text-left pb-3">Email</th>
                <th className="text-right pb-3">Precio</th>
                <th className="text-left pb-3 pl-4">Estado</th>
                <th className="text-left pb-3 pl-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.saleId} className="border-b border-gray-900 hover:bg-white/5 transition">
                  <td className="py-3 text-white font-medium">{s.modelName}</td>
                  <td className="py-3 text-gray-300">{s.buyerName}</td>
                  <td className="py-3 text-gray-400">{s.buyerEmail}</td>
                  <td className="py-3 text-emerald-400 font-semibold text-right">
                    ${s.salePrice?.toLocaleString()}
                  </td>
                  <td className="py-3 pl-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge[s.status] ?? statusBadge.PENDING}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-gray-500 text-xs">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SalesList