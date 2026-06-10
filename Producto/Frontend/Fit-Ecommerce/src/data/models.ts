export interface GymModel {
  id: string
  name: string
  tagline: string
  description: string
  capacity: number
  sqm: number
  price: number
  features: string[]
  badge?: string
}

export const gymModels: GymModel[] = [
  {
    id: 'fit-mini',
    name: 'FitMini',
    tagline: 'Ideal para espacios reducidos',
    description: 'Un contenedor de 20 pies reconvertido en un gimnasio compacto y funcional. Perfecto para uso residencial o pequeños locales comerciales.',
    capacity: 4,
    sqm: 14,
    price: 18000,
    features: ['Aire acondicionado', 'Espejo de pared completa', 'Piso rubber premium', 'Iluminación LED', '4 estaciones de entrenamiento'],
  },
  {
    id: 'fit-standard',
    name: 'FitStandard',
    tagline: 'El más popular',
    description: 'Contenedor de 40 pies con equipamiento completo para entrenamiento funcional y de fuerza. La opción más elegida por emprendedores del fitness.',
    capacity: 8,
    sqm: 28,
    price: 32000,
    features: ['Zona cardio', 'Zona de pesas libres', 'Área funcional', 'Sistema de sonido', 'Baño integrado', 'WiFi'],
    badge: 'Más popular',
  },
  {
    id: 'fit-pro',
    name: 'FitPro',
    tagline: 'Para uso comercial intensivo',
    description: 'Doble contenedor de 40 pies fusionado con dos ambientes separados: sala de pesas y estudio de clases. Diseñado para alto tráfico.',
    capacity: 15,
    sqm: 56,
    price: 58000,
    features: ['2 salas independientes', 'Equipamiento profesional', 'Vestuarios completos', 'Sistema de reservas digital', 'CCTV', 'Rampa de acceso'],
    badge: 'Recomendado',
  },
  {
    id: 'fit-studio',
    name: 'FitStudio',
    tagline: 'Especializado en clases grupales',
    description: 'Contenedor de 40 pies diseñado exclusivamente para clases de yoga, pilates, spinning o crossfit. Piso flotante y acústica optimizada.',
    capacity: 12,
    sqm: 28,
    price: 27500,
    features: ['Piso flotante antiimpacto', 'Acústica profesional', 'Barras de ballet', 'Espejos perimetrales', 'Climatización silenciosa'],
  },
  {
    id: 'fit-elite',
    name: 'FitElite',
    tagline: 'La experiencia premium',
    description: 'Triple módulo con diseño arquitectónico de alto nivel. Acabados premium, iluminación ambiental y tecnología de vanguardia para marcas exclusivas.',
    capacity: 25,
    sqm: 84,
    price: 95000,
    features: ['Diseño arquitectónico personalizado', 'Sauna seco y húmedo', 'Zona de recuperación', 'App de gestión propia', 'Instalación llave en mano', 'Garantía extendida 5 años'],
    badge: 'Premium',
  },
]