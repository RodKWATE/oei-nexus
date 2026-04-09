import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { explorerApi } from '../lib/api'
import { MAP_PROJECTS } from '../data/mockData'

const TECH_FILTERS = ['All', 'solar', 'wind', 'hydro', 'storage', 'hybrid', 'efficiency']
const TECH_LABELS  = { solar: '☀️ Solar', wind: '🌬️ Wind', hydro: '💧 Hydro', storage: '🔋 Storage', hybrid: '⚡ Hybrid', efficiency: '♻️ Efficiency' }
const LEVEL_COLORS = { Platinum: '#FFD54F', Gold: '#26A69A', Silver: '#90CAF9', Bronze: '#CE93D8' }

/** Convert lat/lon → CSS left%/top% on the simple equirectangular SVG map */
function geoToPercent(lat, lon) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top:  `${((90 - lat)  / 180) * 100}%`,
  }
}

function typeIcon(t) {
  const icons = { solar: '☀️', wind: '🌬️', hydro: '💧', storage: '🔋', hybrid: '⚡', efficiency: '♻️', biomass: '🌿', geothermal: '🌋' }
  return icons[t] ?? '⚡'
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
            className={`px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all duration-200
              ${active
                ? 'bg-[rgba(0,150,136,0.15)] border-brand-teal text-brand-teal3'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-brand-teal hover:text-brand-teal3'}`}>
      {label}
    </button>
  )
}

function MapMarker({ p, selected, onClick }) {
  const dotColor = LEVEL_COLORS[p.oei_level] ?? '#26A69A'
  return (
    <div className="absolute cursor-pointer group"
         style={{ left: p._left, top: p._top, transform: 'translate(-50%,-50%)' }}
         onClick={onClick}>
      <div className="w-3 h-3 rounded-full border-2 border-white/30 transition-all duration-200 animate-marker-ping"
           style={{
             background: dotColor,
             boxShadow: selected ? `0 0 24px ${dotColor}` : `0 0 16px ${dotColor}80`,
             transform: selected ? 'scale(1.5)' : undefined,
           }} />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none
                      text-[10px] font-bold text-brand-teal2 px-2 py-1 rounded-md"
           style={{ background:'rgba(2,11,24,0.9)', border:'1px solid #009688' }}>
        {p.name} • {p.oei_score ?? '—'}
      </div>
    </div>
  )
}

/** Normalise an API project (ProjectSummary shape) into the display shape */
function normalise(p) {
  const pos = (p.latitude != null && p.longitude != null)
    ? geoToPercent(p.latitude, p.longitude)
    : { left: '50%', top: '50%' }
  return { ...p, _left: pos.left, _top: pos.top }
}

/** Normalise a mock project into the same shape */
function normaliseMock(p) {
  return {
    id: p.id,
    name: p.name,
    country: p.country,
    project_type: p.tech.toLowerCase().replace(/[^a-z]/g, '') || 'solar',
    oei_score: p.score,
    oei_level: p.level,
    _left: p.left,
    _top:  p.top,
  }
}

export default function Explorer() {
  const { data: apiProjects, loading } = useApi(explorerApi.map, { fallback: null })

  const projects = apiProjects
    ? apiProjects.map(normalise)
    : MAP_PROJECTS.map(normaliseMock)

  const [selectedId, setSelectedId] = useState(null)
  const [typeFilter, setTypeFilter]  = useState('All')

  const filtered = typeFilter === 'All'
    ? projects
    : projects.filter((p) => p.project_type === typeFilter)

  const selected = filtered.find((p) => String(p.id) === String(selectedId)) ?? filtered[0]

  const avgScore = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.oei_score ?? 0), 0) / projects.length)
    : 0

  return (
    <div className="flex h-screen pt-[68px]" style={{ height: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[360px] flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden"
             style={{ background:'rgba(2,11,24,0.6)' }}>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-3.5">🔍 Filter Projects</div>

          <div className="mb-3.5">
            <div className="text-[11.5px] text-slate-500 mb-1.5 font-medium">Technology</div>
            <div className="flex flex-wrap gap-1.5">
              {TECH_FILTERS.map((t) => (
                <FilterChip key={t} label={t === 'All' ? 'All' : TECH_LABELS[t] ?? t}
                            active={typeFilter === t}
                            onClick={() => setTypeFilter(t)} />
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="px-4 py-3.5 flex justify-between text-xs text-slate-500 border-b border-white/10">
          <span>{loading ? 'Loading…' : `${filtered.length} projects`}</span>
          <span className="text-brand-teal2">{loading ? '' : 'Live data'}</span>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => setSelectedId(p.id)}
                 className={`rounded-lg p-4 cursor-pointer transition-all duration-200 border
                   ${String(selectedId ?? (filtered[0]?.id)) === String(p.id)
                     ? 'border-brand-teal bg-[rgba(0,150,136,0.08)]'
                     : 'border-white/10 bg-white/5 hover:border-brand-teal hover:bg-[rgba(0,150,136,0.08)]'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[13.5px] font-bold">{p.name}</span>
                {p.oei_score != null && (
                  <span className="text-[13px] font-extrabold px-2.5 py-0.5 rounded-full"
                        style={{ color:'#26A69A', background:'rgba(0,150,136,0.1)', border:'1px solid rgba(0,150,136,0.2)' }}>
                    {p.oei_score}
                  </span>
                )}
              </div>
              <div className="flex gap-2.5 text-[11.5px] text-slate-500">
                <span>🌍 {p.country ?? '—'}</span>
                <span>{typeIcon(p.project_type)} {p.project_type}</span>
                {p.oei_level && <span>{p.oei_level === 'Platinum' ? '✦' : '●'} {p.oei_level}</span>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Map ──────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden" style={{ background:'#071628' }}>
        {/* World map SVG */}
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

        <div className="absolute inset-0 pointer-events-none"
             style={{ background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(0,150,136,0.04) 0%,transparent 60%)' }} />

        {/* Markers */}
        {filtered.map((p) => (
          <MapMarker key={p.id} p={p}
                     selected={String(selectedId ?? filtered[0]?.id) === String(p.id)}
                     onClick={() => setSelectedId(p.id)} />
        ))}

        {/* Stats overlay */}
        <div className="absolute top-5 right-5 flex flex-col gap-2">
          {[
            [String(projects.length), 'Active Projects'],
            [String(new Set(projects.map(p => p.country)).size), 'Countries'],
            [String(avgScore), 'Avg. OEI Score'],
          ].map(([v, l]) => (
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
          {[['#FFD54F','rgba(255,213,79,0.6)','Platinum (90+)'],['#26A69A',null,'Gold (75–89)'],['#90CAF9',null,'Silver (55–74)'],['#CE93D8',null,'Bronze (<55)']].map(([color,glow,label]) => (
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
