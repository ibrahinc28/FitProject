import type { GymModel } from '../data/models'

interface Props {
  model: GymModel
}

export default function ModelCard({ model }: Props) {
  const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(model.price)

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-green-500/50 transition-colors">
      {model.badge && (
        <span className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
          {model.badge}
        </span>
      )}

      <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">
        🏋️
      </div>

      <h3 className="text-xl font-bold text-white">{model.name}</h3>
      <p className="text-green-400 text-sm mt-0.5 mb-3">{model.tagline}</p>
      <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{model.description}</p>

      <div className="flex gap-4 text-sm text-gray-500 mb-4">
        <span>👥 {model.capacity} pers.</span>
        <span>📐 {model.sqm} m²</span>
      </div>

      <ul className="space-y-1.5 mb-6">
        {model.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-green-400 mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Desde</p>
          <p className="text-2xl font-extrabold text-white">{formattedPrice}</p>
        </div>
        <a
          href="#contacto"
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Cotizar
        </a>
      </div>
    </div>
  )
}