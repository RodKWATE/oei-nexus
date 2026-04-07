import { useState } from 'react'
import { MAP_PROJECTS } from '../data/mockData'

const TECH_FILTERS = ['All', '☀️ Solar', '🌬️ Wind', '🤖 AI Grid', '⚡ Mini-Grid', '💧 Hydro', '🔋 Storage']

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all duration-200
        ${active
          ? 'bg-[rgba(0,150,136,0.15)] border-brand-teal text-brand-teal3'
          : 'bg-white/5 border-white/10 text-slate-400 hover:border-brand-teal hover:text-brand-teal3'}`}
    >
      {label}
    </button>
  )
}

function MapMarker({ p, selected, onClick }) {
  return (
    <div
      className="absolute cursor-pointer group"
      style={{ left: p.left, top: p.top, transform: 'translate(-50%,-50%)' }}
      onClick={onClick}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-white/30 transition-all duration-200
                   animate-marker-ping group-hover:scale-150"
        style={{
          background: p.dotColor,
          boxShadow: selected ? `0 0 24px ${p.dotColor}` : `0 0 16px ${p.dotColor}80`,
          transform: selected ? 'scale(1.5)' : undefined,
        }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none
                      text-[10px] font-bold text-brand-teal2 px-2 py-1 rounded-md"
           style={{ background:'rgba(2,11,24,0.9)', border:'1px solid #009688' }}>
        {p.name} • {p.score}
      </div>
    </div>
  )
}

export default function Explorer() {
  const [selectedId, setSelectedId] = useState(1)
  const [techFilter, setTechFilter] = useState('All')

  const filtered = techFilter === 'All'
    ? MAP_PROJECTS
    : MAP_PROJECTS.filter(p => p.tech.includes(techFilter.slice(2).trim().split(' ')[0]))

  return (
    <div className="flex h-screen pt-[68px]" style={{ height: '100vh' }}>

      {/* Sidebar */}
      <aside className="w-[360px] flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden"
             style={{ background:'rgba(2,11,24,0.6)' }}>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-3.5">🔍 Filter Projects</div>

          <div className="mb-3.5">
            <div className="text-[11.5px] text-slate-500 mb-1.5 font-medium">Country / Region</div>
            <select className="w-full px-3 py-2 rounded-lg text-[13px] text-white outline-none
                               appearance-none cursor-pointer transition-colors"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <option>All Regions</option>
              <option>Sub-Saharan Africa</option>
              <option>South Asia</option>
              <option>Latin America</option>
              <option>MENA</option>
              <option>Southeast Asia</option>
            </select>
          </div>

          <div className="mb-3.5">
            <div className="text-[11.5px] text-slate-500 mb-1.5 font-medium">Technology</div>
            <div className="flex flex-wrap gap-1.5">
              {TECH_FILTERS.map((t) => (
                <FilterChip key={t} label={t} active={techFilter === t} onClick={() => setTechFilter(t)} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] text-slate-500 mb-1.5 font-medium">OEI Score Range</div>
            <select className="w-full px-3 py-2 rounded-lg text-[13px] text-white outline-none appearance-none"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <option>All Levels</option>
              <option>✦ Platinum (85–100)</option>
              <option>✦ Gold (70–84)</option>
              <option>● Silver (55–69)</option>
            </select>
          </div>
        </div>

        {/* Count + sort */}
        <div className="px-4 py-3.5 flex justify-between text-xs text-slate-500 border-b border-white/10">
          <span>{filtered.length} projects</span>
          <button className="text-brand-teal2 hover:text-white transition-colors">Sort by Score ↓</button>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`rounded-lg p-4 cursor-pointer transition-all duration-200 border
                ${selectedId === p.id
                  ? 'border-brand-teal bg-[rgba(0,150,136,0.08)]'
                  : 'border-white/10 bg-white/5 hover:border-brand-teal hover:bg-[rgba(0,150,136,0.08)]'}`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-[13.5px] font-bold">{p.name}</span>
                <span className="text-[13px] font-extrabold px-2.5 py-0.5 rounded-full"
                      style={{ color:'#26A69A', background:'rgba(0,150,136,0.1)', border:'1px solid rgba(0,150,136,0.2)' }}>
                  {p.score}
                </span>
              </div>
              <div className="flex gap-2.5 text-[11.5px] text-slate-500 mb-3">
                <span>🌍 {p.country}</span>
                <span>{p.tech}</span>
                <span>{p.level === 'Platinum' ? '✦' : '●'} {p.level}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[`🌱 ${p.co2}`, `👥 ${p.users}`, `💰 ${p.budget}`].map((ind) => (
                  <span key={ind} className="text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded">{ind}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden" style={{ background:'#071628' }}>
        {/* Simplified world map SVG */}
        <svg className="w-full h-full opacity-60" viewBox="0 0 900 500" preserveAspectRatio="xMidYMid slice">
          <rect width="900" height="500" fill="#071628"/>
          <path d="M80,60 L200,50 L230,80 L240,160 L210,200 L180,190 L160,220 L140,200 L100,180 L70,150 L60,100 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M160,230 L220,220 L250,260 L260,320 L240,380 L210,400 L190,360 L170,300 L150,260 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M390,40 L460,35 L480,60 L470,90 L440,100 L420,85 L400,90 L385,70 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M400,110 L470,100 L510,130 L520,200 L510,280 L490,340 L460,360 L430,340 L410,280 L390,200 L385,140 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M480,30 L680,20 L730,60 L750,120 L720,160 L680,150 L640,170 L600,160 L560,140 L520,100 L490,80 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M660,160 L720,150 L740,200 L720,230 L700,220 L680,200 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <path d="M660,270 L760,260 L800,300 L790,360 L750,380 L700,370 L660,330 Z" fill="#0D2545" stroke="#1565C0" strokeWidth="0.8" opacity="0.8"/>
          <line x1="0" y1="250" x2="900" y2="250" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          <line x1="450" y1="0" x2="450" y2="500" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        </svg>

        {/* Subtle glow overlay */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(0,150,136,0.04) 0%,transparent 60%)' }} />

        {/* Markers */}
        {MAP_PROJECTS.map((p) => (
          <MapMarker key={p.id} p={p} selected={selectedId === p.id} onClick={() => setSelectedId(p.id)} />
        ))}

        {/* Stats overlay */}
        <div className="absolute top-5 right-5 flex flex-col gap-2">
          {[['2,847','Active Projects'],['94','Countries'],['76.2','Avg. OEI Score']].map(([v,l]) => (
            <div key={l} className="glass-dark rounded-lg px-4 py-3 min-w-[140px]"
                 style={{ backdropFilter:'blur(12px)' }}>
              <div className="text-[20px] font-extrabold text-brand-teal2">{v}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-5 left-5 glass-dark rounded-[10px] p-3 px-4"
             style={{ backdropFilter:'blur(12px)' }}>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-2">OEI Level</div>
          {[['#FFD54F','rgba(255,213,79,0.6)','Platinum (85–100)'],['#4DB6AC',null,'Gold (70–84)'],['#90CAF9',null,'Silver (55–69)']].map(([color,glow,label]) => (
            <div key={label} className="flex items-center gap-2 text-[12px] text-slate-300 mb-1.5 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background:color, boxShadow: glow ? `0 0 8px ${glow}` : undefined }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
