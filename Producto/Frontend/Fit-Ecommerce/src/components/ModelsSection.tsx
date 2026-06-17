import type { GymModel } from '../data/models'
import ModelCard from './ModelCard'

async function fetchModels(): Promise<GymModel[]> {
  const gateway = process.env.INTERNAL_API_URL ?? 'http://localhost:4000'
  try {
    const res = await fetch(`${gateway}/api/v1/models`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ModelsSection() {
  const models = await fetchModels()

  return (
    <section id="modelos" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">Nuestros Modelos</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Cada modelo se entrega armado y equipado. Elige el que mejor se adapta a tu espacio y presupuesto.
          </p>
        </div>

        {models.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No hay modelos disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map(m => <ModelCard key={m.modelId} model={m} />)}
          </div>
        )}
      </div>
    </section>
  )
}
