import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitProject — Gimnasios en Contenedores',
  description: 'Soluciones modulares de fitness en contenedores para cualquier espacio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}