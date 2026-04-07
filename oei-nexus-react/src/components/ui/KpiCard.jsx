export default function KpiCard({ icon, value, label, delta, up, color }) {
  return (
    <div
      className="glass rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: color }}
      />
      <span className="text-2xl mb-3 block">{icon}</span>
      <div className="text-[28px] font-black tracking-tight leading-none mb-1 text-white/90">
        {value}
      </div>
      <div className="text-[12.5px] text-slate-500 font-medium mb-3">{label}</div>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
        ${up
          ? 'bg-[rgba(76,175,80,0.12)] text-brand-green3'
          : 'bg-[rgba(239,154,154,0.12)] text-[#EF9A9A]'}`}
      >
        {up ? '▲' : '▼'} {delta}
      </span>
    </div>
  )
}
