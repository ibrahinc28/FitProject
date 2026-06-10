interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colorMap = {
  blue: 'border-blue-500 text-blue-400',
  green: 'border-green-500 text-green-400',
  yellow: 'border-yellow-500 text-yellow-400',
  red: 'border-red-500 text-red-400',
  purple: 'border-purple-500 text-purple-400',
}

export default function KpiCard({ title, value, subtitle, color = 'blue' }: KpiCardProps) {
  return (
    <div className={`bg-[#111] border-l-4 ${colorMap[color]} rounded-xl p-5`}>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color].split(' ')[1]}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}