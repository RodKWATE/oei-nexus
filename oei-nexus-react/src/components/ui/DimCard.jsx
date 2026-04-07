import ProgressBar from './ProgressBar'

export default function DimCard({ icon, name, score, change, color, gradient, bg, border }) {
  const isUp = change > 0
  return (
    <div
      className="glass rounded-lg p-4.5 transition-all duration-200 hover:bg-[rgba(0,150,136,0.05)] hover:border-[rgba(0,150,136,0.3)]"
      style={{ padding: '18px' }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          {icon}
        </div>
        <span className="text-[13px] font-semibold">{name}</span>
      </div>
      <ProgressBar value={score} gradient={gradient} className="mb-2" />
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold" style={{ color }}>{score}/100</span>
        <span className={isUp ? 'text-brand-green3' : 'text-[#EF9A9A]'} style={{ fontSize: '11px' }}>
          {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{change} pts
        </span>
      </div>
    </div>
  )
}
