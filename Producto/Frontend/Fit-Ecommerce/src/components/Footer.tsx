export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p className="font-bold text-white text-lg">FitProject</p>
        <p>© {new Date().getFullYear()} FitProject. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#modelos" className="hover:text-white transition-colors">Modelos</a>
          <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  )
}