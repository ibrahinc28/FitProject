const features = [
  { icon: '⚡', title: 'Instalación rápida', desc: 'En 2 semanas tienes tu gimnasio operativo. Sin obras, sin permisos de construcción.' },
  { icon: '🔧', title: 'Llave en mano', desc: 'Entregamos el contenedor completamente equipado, conectado y listo para usar.' },
  { icon: '♻️', title: 'Sustentable', desc: 'Reutilizamos contenedores en desuso. Menor huella de carbono que una construcción tradicional.' },
  { icon: '📦', title: 'Modular y expandible', desc: 'Comienza con un módulo y escala agregando más cuando tu negocio crezca.' },
  { icon: '🎨', title: 'Diseño personalizado', desc: 'Adaptamos colores, acabados y distribución a tu identidad de marca.' },
  { icon: '🛡️', title: 'Garantía incluida', desc: 'Todos los modelos incluyen garantía de 2 años en estructura y equipamiento.' },
]

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="bg-gray-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">¿Por qué elegirnos?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            FitProject combina innovación, sostenibilidad y practicidad para llevar el fitness a cualquier rincón.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}