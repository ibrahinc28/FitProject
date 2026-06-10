'use client'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="#hero" className="text-white font-bold text-xl tracking-tight">FitProject</a>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#modelos" className="hover:text-white transition-colors">Modelos</a>
          <a href="#caracteristicas" className="hover:text-white transition-colors">Características</a>
          <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
          <a
            href="#contacto"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Cotizar
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-2xl">
          {open ? '✕' : '☰'}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-black px-4 pb-4 flex flex-col gap-4 text-gray-300 text-sm border-t border-white/10">
          <a href="#modelos" onClick={() => setOpen(false)} className="pt-4 hover:text-white">Modelos</a>
          <a href="#caracteristicas" onClick={() => setOpen(false)} className="hover:text-white">Características</a>
          <a href="#contacto" onClick={() => setOpen(false)} className="hover:text-white">Contacto</a>
        </div>
      )}
    </nav>
  )
}