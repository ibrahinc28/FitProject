import React, { useEffect, useState } from 'react'
import type { GymModel } from '../../types/sales'
import { getModels } from '../../services/salesService'

interface Props {
  onSelectModel: (model: GymModel) => void
}

const ModelList: React.FC<Props> = ({ onSelectModel }) => {
  const [models, setModels] = useState<GymModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getModels()
      .then(setModels)
      .catch(() => setError('No se pudieron cargar los modelos'))
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((m) => (
        <div
          key={m.modelId}
          className="bg-[#161616] border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition cursor-pointer group"
          onClick={() => onSelectModel(m)}
        >
          {m.imageUrl && (
            <img src={m.imageUrl} alt={m.name}
              className="w-full h-40 object-cover bg-gray-800"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white font-semibold group-hover:text-emerald-400 transition">{m.name}</h3>
              <span className="text-emerald-400 font-bold text-sm">${m.price?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{m.description}</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{m.areaM2} m²</span>
              <span>·</span>
              <span>{m.capacity} personas</span>
            </div>
            {!m.available && (
              <span className="mt-2 inline-block text-xs text-red-400 border border-red-700 rounded px-2 py-0.5">
                No disponible
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ModelList