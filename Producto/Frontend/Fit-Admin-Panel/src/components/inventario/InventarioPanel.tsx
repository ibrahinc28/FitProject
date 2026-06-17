import React, { useEffect, useState, Component } from 'react'
import {
  getInsumos, createInsumo, addStock, getTransacciones,
  type Insumo, type Transaccion,
} from '../../services/inventarioService'

class ErrorBoundary extends Component<{children: React.ReactNode}, {error: string | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(err: Error) { return { error: err.message } }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-bold mb-1">Error al renderizar el panel de inventario:</p>
          <p className="text-sm font-mono">{this.state.error}</p>
        </div>
      )
    }
    return this.props.children
  }
}

const InventarioPanel: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', cantidadDisponible: 0, unidadMedida: '' })
  const [formError, setFormError] = useState('')

  // Add stock modal
  const [stockTarget, setStockTarget] = useState<Insumo | null>(null)
  const [stockQty, setStockQty] = useState(1)
  const [addingStock, setAddingStock] = useState(false)

  // Transaction history modal
  const [txTarget, setTxTarget] = useState<Insumo | null>(null)
  const [txList, setTxList] = useState<Transaccion[]>([])
  const [txLoading, setTxLoading] = useState(false)

  const load = () => {
    getInsumos()
      .then(setInsumos)
      .catch(() => setError('No se pudo cargar el inventario.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio'); return }
    if (!form.unidadMedida.trim()) { setFormError('La unidad de medida es obligatoria'); return }
    if (form.cantidadDisponible < 0) { setFormError('La cantidad no puede ser negativa'); return }
    setCreating(true)
    setFormError('')
    try {
      const created = await createInsumo({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        cantidadDisponible: form.cantidadDisponible,
        unidadMedida: form.unidadMedida.trim(),
      })
      setInsumos(prev => [created, ...prev])
      setSuccess(`Insumo "${created.nombre}" creado exitosamente.`)
      setShowCreate(false)
      setForm({ nombre: '', descripcion: '', cantidadDisponible: 0, unidadMedida: '' })
    } catch {
      setFormError('Error al crear el insumo. Intenta de nuevo.')
    } finally {
      setCreating(false)
    }
  }

  const handleAddStock = async () => {
    if (!stockTarget || stockQty <= 0) return
    setAddingStock(true)
    try {
      const updated = await addStock(stockTarget.insumoId, stockQty)
      setInsumos(prev => prev.map(i => i.insumoId === updated.insumoId ? updated : i))
      setSuccess(`Stock de "${updated.nombre}" actualizado a ${updated.cantidadDisponible} ${updated.unidadMedida}.`)
      setStockTarget(null)
      setStockQty(1)
    } catch {
      setError('Error al actualizar el stock.')
    } finally {
      setAddingStock(false)
    }
  }

  const openTx = (insumo: Insumo) => {
    setTxTarget(insumo)
    setTxLoading(true)
    setTxList([])
    getTransacciones(insumo.insumoId)
      .then(setTxList)
      .catch(() => { /* silent */ })
      .finally(() => setTxLoading(false))
  }

  const stockColor = (stock: number) => {
    if (stock === 0) return 'text-red-500'
    if (stock <= 5) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona los insumos y el stock disponible</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError('') }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          + Nuevo insumo
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 ml-2">✕</button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 ml-2">✕</button>
        </div>
      )}

      {/* Create insumo form */}
      {showCreate && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear nuevo insumo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{formError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Cemento Portland"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unidad de medida *</label>
                <input
                  type="text"
                  value={form.unidadMedida}
                  onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}
                  placeholder="Ej: sacos, litros, kg, m²"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Stock inicial</label>
                <input
                  type="number"
                  min={0}
                  value={form.cantidadDisponible}
                  onChange={e => setForm(f => ({ ...f, cantidadDisponible: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition"
              >
                {creating ? 'Creando...' : 'Crear insumo'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setFormError('') }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Insumos table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {insumos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No hay insumos registrados. Crea el primero.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Insumo</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Descripción</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Unidad</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((ins, i) => (
                  <tr key={ins.insumoId}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-3 font-medium text-gray-900">{ins.nombre}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {ins.descripcion ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold text-base ${stockColor(ins.cantidadDisponible)}`}>
                      {ins.cantidadDisponible}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{ins.unidadMedida}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setStockTarget(ins); setStockQty(1) }}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => openTx(ins)}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
                        >
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add stock modal */}
      {stockTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Agregar stock</h3>
            <p className="text-gray-500 text-sm mb-4">
              {stockTarget.nombre} — stock actual: <strong>{stockTarget.cantidadDisponible} {stockTarget.unidadMedida}</strong>
            </p>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad a agregar</label>
            <input
              type="number"
              min={1}
              value={stockQty}
              onChange={e => setStockQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddStock}
                disabled={addingStock || stockQty <= 0}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition"
              >
                {addingStock ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => { setStockTarget(null); setStockQty(1) }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history modal */}
      {txTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Historial de movimientos</h3>
                <p className="text-gray-500 text-sm">{txTarget.nombre}</p>
              </div>
              <button
                onClick={() => setTxTarget(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {txLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : txList.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Sin movimientos registrados.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Tipo</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Cant.</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Stock</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 hidden sm:table-cell">Referencia</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txList.map(tx => (
                      <tr key={tx.transaccionId} className="border-b border-gray-50">
                        <td className="py-2 pr-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            tx.tipo === 'ENTRADA'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {tx.tipo}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium text-gray-800">
                          {tx.tipo === 'ENTRADA' ? '+' : '-'}{tx.cantidad}
                        </td>
                        <td className="py-2 text-right text-gray-500">{tx.stockResultante}</td>
                        <td className="py-2 text-gray-500 hidden sm:table-cell text-xs truncate max-w-[120px]">
                          {tx.referencia ?? '—'}
                        </td>
                        <td className="py-2 text-gray-400 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const InventarioPanelWithBoundary: React.FC = () => (
  <ErrorBoundary><InventarioPanel /></ErrorBoundary>
)

export default InventarioPanelWithBoundary
