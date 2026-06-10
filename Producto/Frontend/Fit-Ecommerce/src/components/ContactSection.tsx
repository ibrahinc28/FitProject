'use client'
import { useState, type FormEvent } from 'react'
import { gymModels } from '../data/models'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', model: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // In production this would POST to a backend or email service
    setSubmitted(true)
  }

  return (
    <section id="contacto" className="bg-black py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-white mb-3">Solicitar Cotización</h2>
          <p className="text-gray-400">Completa el formulario y te contactamos dentro de las 24 hs.</p>
        </div>

        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-white text-2xl font-bold mb-2">¡Consulta enviada!</h3>
            <p className="text-gray-400">Nos pondremos en contacto contigo muy pronto.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-green-400 hover:text-green-300 text-sm underline"
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre completo *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Juan García"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+54 9 11 0000-0000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modelo de interés</label>
                <select
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="">Seleccionar modelo…</option>
                  {gymModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Mensaje</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Cuéntanos sobre tu proyecto, espacio disponible, presupuesto estimado..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-colors text-lg"
            >
              Enviar Consulta
            </button>
          </form>
        )}
      </div>
    </section>
  )
}