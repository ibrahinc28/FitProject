import React, { useEffect, useState } from 'react'
import { getInsumos } from '../../services/inventarioService'
import type { Insumo } from '../../services/inventarioService'

const InventarioPage: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getInsumos()
      .then(setInsumos)
      .catch(() => setError('No se pudo cargar el inventario. Verifica la conexión.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = insumos.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const stockColor = (stock: number) => {
    if (stock === 0) return 'text-red-400'
    if (stock <= 5) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Inventario</h1>
        <p className="text-gray-500 text-sm mt-1">Vista de solo lectura del stock disponible</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full max-w-sm px-3 py-2 bg-[#161616] border border-gray-700 text-white rounded-lg text-sm outline-none focus:border-orange-500"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !error && (
        <div className="bg-[#161616] border border-gray-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                {insumos.length === 0 ? 'No hay insumos registrados.' : 'No se encontraron resultados.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-5 py-3">Insumo</th>
                  <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Descripción</th>
                  <th className="text-right text-gray-500 text-xs font-semibold uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-5 py-3">Unidad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ins, i) => (
                  <tr key={ins.insumoId}
                    className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 text-white font-medium">{ins.nombre}</td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                      {ins.descripcion ?? <span className="text-gray-700">—</span>}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${stockColor(ins.cantidadDisponible)}`}>
                      {ins.cantidadDisponible}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{ins.unidadMedida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p className="text-gray-700 text-xs mt-3 text-right">
        {filtered.length} insumo{filtered.length !== 1 ? 's' : ''}
        {insumos.length !== filtered.length ? ` de ${insumos.length}` : ''}
      </p>
    </div>
  )
}

export default InventarioPage
