import type { GymModel } from '../data/models'

interface Props { model: GymModel }

type Tier = 'mini' | 'standard' | 'pro' | 'studio' | 'elite'

function tier(name: string): Tier {
  const n = name.toLowerCase()
  if (n.includes('mini'))     return 'mini'
  if (n.includes('pro'))      return 'pro'
  if (n.includes('studio'))   return 'studio'
  if (n.includes('elite'))    return 'elite'
  return 'standard'
}

const THEME: Record<Tier, { bg: string; accent: string; badge: string | null }> = {
  mini:     { bg: 'from-emerald-950 to-gray-950', accent: '#34d399', badge: null },
  standard: { bg: 'from-green-950 to-gray-950',   accent: '#22c55e', badge: 'Más popular' },
  pro:      { bg: 'from-teal-950 to-gray-950',    accent: '#2dd4bf', badge: 'Recomendado' },
  studio:   { bg: 'from-violet-950 to-gray-950',  accent: '#a78bfa', badge: null },
  elite:    { bg: 'from-amber-950 to-gray-950',   accent: '#fbbf24', badge: 'Premium' },
}

/* ─── SVG container building components ─── */

function Rib({ x1, y1, x2, y2 }: { x1:number; y1:number; x2:number; y2:number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth={0.8} />
}

function Window({ x, y, a }: { x:number; y:number; a:string }) {
  return <rect x={x} y={y} width={16} height={11} rx={1} fill="#020617" stroke={a} strokeWidth={1.2} />
}

function Box({ x, y, w, h, a, ribs = 4, windows = 2, door = true }: {
  x:number; y:number; w:number; h:number; a:string;
  ribs?: number; windows?: number; door?: boolean
}) {
  const ribStep = w / (ribs + 1)
  return (
    <>
      <rect x={x} y={y} width={w} height={5} rx={1} fill="#374151" />
      <rect x={x} y={y+5} width={w} height={h-5} rx={1} fill="#1f2937" stroke="#374151" strokeWidth={1.5} />
      {Array.from({ length: ribs }).map((_, i) => (
        <Rib key={i} x1={x + ribStep * (i+1)} y1={y+5} x2={x + ribStep * (i+1)} y2={y+h} />
      ))}
      {windows >= 1 && <Window x={x+7}     y={y+11} a={a} />}
      {windows >= 2 && <Window x={x+w-23}  y={y+11} a={a} />}
      {door && (
        <>
          <rect x={x+w/2-8} y={y+h-28} width={16} height={28} rx={1} fill="#020617" stroke={a} strokeWidth={1.2} />
          <circle cx={x+w/2+4} cy={y+h-14} r={1.5} fill={a} />
        </>
      )}
    </>
  )
}

function Ground({ y }: { y: number }) {
  return <line x1={10} y1={y} x2={250} y2={y} stroke="#374151" strokeWidth={1.5} />
}

function MiniIllustration({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 260 105" className="w-full h-full">
      <Ground y={95} />
      <Box x={80} y={30} w={100} h={65} a={a} ribs={3} windows={2} />
    </svg>
  )
}

function StandardIllustration({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 260 105" className="w-full h-full">
      <Ground y={95} />
      <Box x={45} y={22} w={170} h={73} a={a} ribs={5} windows={2} />
    </svg>
  )
}

function ProIllustration({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 260 105" className="w-full h-full">
      <Ground y={95} />
      <Box x={10}  y={22} w={115} h={73} a={a} ribs={4} windows={2} />
      <Box x={135} y={22} w={115} h={73} a={a} ribs={4} windows={2} />
      {/* connector */}
      <rect x={125} y={40} width={10} height={12} rx={1} fill="#374151" />
    </svg>
  )
}

function StudioIllustration({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 260 105" className="w-full h-full">
      <Ground y={95} />
      {/* body */}
      <rect x={45} y={22} width={170} height={73} rx={1} fill="#1f2937" stroke="#374151" strokeWidth={1.5} />
      <rect x={45} y={22} width={170} height={5}  rx={1} fill="#374151" />
      {[80,110,140,170,200].map(xi => (
        <Rib key={xi} x1={xi} y1={27} x2={xi} y2={95} />
      ))}
      {/* panoramic window strip */}
      <rect x={55} y={32} width={150} height={18} rx={1} fill="#020617" stroke={a} strokeWidth={1.2} />
      {/* door */}
      <rect x={117} y={67} width={26} height={28} rx={1} fill="#020617" stroke={a} strokeWidth={1.2} />
      <circle cx={139} cy={81} r={1.5} fill={a} />
      {/* skylight accents */}
      {[60,90,120,150,180].map(xi => (
        <rect key={xi} x={xi} y={22} width={18} height={3} rx={1} fill={a} opacity={0.35} />
      ))}
    </svg>
  )
}

function EliteIllustration({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 260 115" className="w-full h-full">
      <Ground y={105} />
      {/* left wing */}
      <Box x={8}   y={52} w={72} h={53} a={a} ribs={2} windows={1} />
      {/* center tower */}
      <Box x={94}  y={20} w={72} h={85} a={a} ribs={2} windows={2} />
      {/* right wing */}
      <Box x={180} y={52} w={72} h={53} a={a} ribs={2} windows={1} />
      {/* bridges */}
      <rect x={80} y={52} width={14} height={9} rx={1} fill="#374151" />
      <rect x={166} y={52} width={14} height={9} rx={1} fill="#374151" />
      {/* rooftop detail */}
      <rect x={104} y={16} width={52} height={4} rx={1} fill={a} opacity={0.4} />
    </svg>
  )
}

function Illustration({ name, accent }: { name: string; accent: string }) {
  switch (tier(name)) {
    case 'mini':   return <MiniIllustration a={accent} />
    case 'pro':    return <ProIllustration a={accent} />
    case 'studio': return <StudioIllustration a={accent} />
    case 'elite':  return <EliteIllustration a={accent} />
    default:       return <StandardIllustration a={accent} />
  }
}

/* ─── Card ─── */

export default function ModelCard({ model }: Props) {
  const t = tier(model.name)
  const { bg, accent, badge } = THEME[t]

  const price = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(model.price)

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition-colors">

      {/* Container illustration */}
      <div className={`relative h-40 bg-gradient-to-b ${bg}`}>
        <Illustration name={model.name} accent={accent} />

        {(badge || !model.available) && (
          <span
            className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={model.available
              ? { background: accent + '20', color: accent, border: `1px solid ${accent}55` }
              : { background: '#374151', color: '#9ca3af' }}
          >
            {model.available ? badge : 'No disponible'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white">{model.name}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mt-2 mb-4 flex-1">{model.description}</p>

        <div className="flex gap-5 text-sm text-gray-500 mb-4">
          <span>👥 {model.capacity} personas</span>
          <span>📐 {model.areaM2} m²</span>
        </div>

        <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Desde</p>
            <p className="text-2xl font-extrabold text-white">{price}</p>
          </div>
          <a
            href="#contacto"
            className="font-bold px-5 py-2.5 rounded-xl transition-opacity text-sm hover:opacity-90"
            style={{ backgroundColor: accent, color: '#000' }}
          >
            Cotizar
          </a>
        </div>
      </div>
    </div>
  )
}
