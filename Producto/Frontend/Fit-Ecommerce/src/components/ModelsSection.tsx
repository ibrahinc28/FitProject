import { gymModels } from '../data/models'
import ModelCard from './ModelCard'

export default function ModelsSection() {
  return (
    <section id="modelos" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">Nuestros Modelos</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Cada modelo se entrega armado y equipado. Elige el que mejor se adapta a tu espacio y presupuesto.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gymModels.map(m => <ModelCard key={m.id} model={m} />)}
        </div>
      </div>
    </section>
  )
}