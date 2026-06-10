export default function HeroSection() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-green-950 px-4 pt-16"
    >
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-block bg-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-green-500/30">
          Gimnasios Modulares en Contenedores
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Tu gimnasio,
          <span className="text-green-400"> en cualquier </span>
          lugar
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Convertimos contenedores en espacios fitness de alta calidad. Llave en mano, instalación rápida
          y diseño personalizado para tu negocio.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#modelos"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
          >
            Ver Modelos
          </a>
          <a
            href="#contacto"
            className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
          >
            Solicitar Cotización
          </a>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          {[['50+', 'Instalaciones'], ['5', 'Modelos'], ['100%', 'Llave en mano']].map(([n, l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold text-green-400">{n}</p>
              <p className="text-gray-500 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}