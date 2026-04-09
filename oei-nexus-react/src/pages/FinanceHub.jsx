import { useState } from 'react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import ProgressBar from '../components/ui/ProgressBar'
import { useApi } from '../hooks/useApi'
import { projectsApi } from '../lib/api'
import { FINANCE_PROJECTS } from '../data/mockData'

const TYPE_ICON = { solar: '☀️', wind: '🌬️', hydro: '💧', storage: '🔋', hybrid: '⚡', efficiency: '♻️', biomass: '🌿', geothermal: '🌋' }
const LEVEL_BADGE = {
  Platinum: { label: '✦ Platinum', style: { background:'rgba(224,224,224,0.1)', color:'#E0E0E0', border:'1px solid rgba(224,224,224,0.2)' } },
  Gold:     { label: '✦ Gold',     style: { background:'rgba(255,193,7,0.12)', color:'#FFD54F', border:'1px solid rgba(255,193,7,0.2)' } },
  Silver:   { label: '● Silver',   style: { background:'rgba(144,202,249,0.1)', color:'#90CAF9', border:'1px solid rgba(144,202,249,0.2)' } },
  Bronze:   { label: '● Bronze',   style: { background:'rgba(206,147,216,0.1)', color:'#CE93D8', border:'1px solid rgba(206,147,216,0.2)' } },
}

function fmtM(n) {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n}`
}

function normaliseProject(p) {
  const lvl = LEVEL_BADGE[p.oei_level] ?? LEVEL_BADGE.Gold
  const icon = TYPE_ICON[p.project_type?.toLowerCase()] ?? '⚡'
  return {
    id:        p.id,
    icon,
    iconBg:    'linear-gradient(135deg,rgba(0,150,136,0.15),rgba(21,101,192,0.15))',
    badge:     `${lvl.label} ${p.oei_score ?? '—'}`,
    badgeStyle: lvl.style,
    name:      p.name,
    location:  `🌍 ${p.country ?? '—'}`,
    raised:    fmtM(p.investment_usd ? p.investment_usd * 0.65 : null),
    goal:      fmtM(p.investment_usd),
    pct:       65,
    metrics: [
      p.co2_avoided_tonnes_yr ? `🌱 −${(p.co2_avoided_tonnes_yr / 1e3).toFixed(0)}k tCO₂/yr` : null,
      p.households_connected  ? `👥 ${(p.households_connected / 1e3).toFixed(0)}k people`    : null,
      `⚡ ${p.project_type ?? 'energy'}`,
    ].filter(Boolean),
  }
}

const INVESTOR_MATCHES = [
  { name: 'African Development Bank', pct: 94 },
  { name: 'IFC Green Finance', pct: 89 },
  { name: 'Norfund', pct: 82 },
  { name: 'BNDES Green Bond', pct: 77 },
]

const CROWD_STATS = [
  ['$2.4M', 'Raised via Diaspora'], ['18,400', 'Community Investors'],
  ['34', 'Active Campaigns'],      ['$148', 'Average Investment'],
]

const FINANCE_FILTERS = ['All', 'Gold+', 'Solar', '< $50M', 'Africa']

export default function FinanceHub() {
  const { data: apiProjects } = useApi(projectsApi.list, { fallback: null })
  const [activeFilter, setActiveFilter] = useState('All')

  const rawProjects = apiProjects
    ? apiProjects.map(normaliseProject)
    : FINANCE_PROJECTS

  const projects = activeFilter === 'All' ? rawProjects : rawProjects.filter((p) => {
    if (activeFilter === 'Gold+')  return p.badge.includes('Gold') || p.badge.includes('Platinum')
    if (activeFilter === 'Solar')  return p.icon === '☀️'
    if (activeFilter === '< $50M') return p.goal && parseFloat(p.goal.replace(/[^0-9.]/g,'')) < 50
    if (activeFilter === 'Africa') return p.location.includes('Africa') || ['Senegal','Kenya','Egypt','Niger','Nigeria','Ghana'].some((c) => p.location.includes(c))
    return true
  })

  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between py-10 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Finance Hub</h1>
          <p className="text-[14.5px] text-slate-500 mt-1.5">Connect capital with impact — OEI-matched investment flows</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost">I'm an Investor</Button>
          <Button variant="small">+ List a Project</Button>
        </div>
      </div>

      {/* Finance hero */}
      <div className="rounded-3xl p-10 mb-8 grid gap-10"
           style={{
             background:'linear-gradient(135deg,rgba(0,150,136,0.08),rgba(21,101,192,0.08))',
             border:'1px solid rgba(0,150,136,0.15)',
             gridTemplateColumns:'1fr 1fr',
           }}>
        <div>
          <Badge variant="teal" className="mb-4">💰 Finance Intelligence</Badge>
          <h2 className="text-[32px] font-extrabold tracking-tight mb-3 leading-tight">
            Match Capital with<br />Inclusive Energy Projects
          </h2>
          <p className="text-[15px] text-slate-400 leading-[1.7] mb-6">
            OEI Nexus uses score-based compatibility matching to connect development finance
            institutions, impact investors, and diaspora capital with projects that align with
            their SDG mandate, geography, and risk profile.
          </p>
          <div className="flex gap-7">
            {[['$12.3B','Capital Deployed'],['847','Active Investors'],['96%','Match Rate']].map(([v,l]) => (
              <div key={l}>
                <div className="text-[24px] font-extrabold tracking-tight gradient-text-score">{v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Match widget */}
        <div className="rounded-2xl p-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.10)' }}>
          <div className="text-[14px] font-bold text-brand-teal3 mb-4">🤝 Investor Match Score</div>
          {INVESTOR_MATCHES.map((m) => (
            <div key={m.name} className="mb-3">
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="text-slate-300 font-medium">{m.name}</span>
                <span className="text-brand-teal2 font-bold">{m.pct}%</span>
              </div>
              <ProgressBar value={m.pct} gradient="linear-gradient(90deg,#009688,#4DB6AC)" height="h-1.5" />
            </div>
          ))}
          <button className="w-full mt-4 py-3 rounded-lg text-[13.5px] font-semibold text-white btn-gradient">
            🔗 Initiate Match Process
          </button>
        </div>
      </div>

      {/* Finance cards */}
      <div className="flex items-center justify-between mb-4.5">
        <h3 className="text-[16px] font-bold">Open Investment Opportunities</h3>
        <div className="flex gap-2">
          {FINANCE_FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all duration-200
                ${activeFilter === f
                  ? 'bg-[rgba(0,150,136,0.15)] border-brand-teal text-brand-teal3'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-brand-teal hover:text-brand-teal3'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {projects.map((p) => (
          <div key={p.id ?? p.name}
            className="glass rounded-2xl p-6 cursor-pointer transition-all duration-200
                       hover:border-[rgba(0,150,136,0.35)] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px]"
                   style={{ background: p.iconBg, border: '1px solid rgba(255,193,7,0.2)' }}>
                {p.icon}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                    style={p.badgeStyle}>
                {p.badge}
              </span>
            </div>
            <div className="text-[16px] font-bold mb-1">{p.name}</div>
            <div className="text-[12.5px] text-slate-500 mb-4">{p.location}</div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-brand-teal2">{p.raised} raised</span>
                <span className="text-slate-500">/ {p.goal} goal</span>
              </div>
              <ProgressBar value={p.pct} gradient="linear-gradient(90deg,#009688,#00E676)" height="h-1.5" />
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              {p.metrics.map((m) => (
                <span key={m} className="text-[11.5px] text-slate-400 flex items-center gap-1">{m}</span>
              ))}
            </div>

            <button className="w-full py-2.5 rounded-lg text-[13px] font-semibold
                               border border-[rgba(0,150,136,0.3)] bg-[rgba(0,150,136,0.08)]
                               text-brand-teal3 hover:bg-[rgba(0,150,136,0.18)] hover:text-white transition-colors">
              View Investment Brief →
            </button>
          </div>
        ))}
      </div>

      {/* Diaspora section */}
      <div className="rounded-3xl p-9 mb-8 grid gap-10 items-center"
           style={{
             background:'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(0,150,136,0.06))',
             border:'1px solid rgba(76,175,80,0.15)',
             gridTemplateColumns:'1fr 1fr',
           }}>
        <div>
          <Badge variant="green" className="mb-4">🌐 New Feature</Badge>
          <h3 className="text-[22px] font-extrabold mb-2.5 tracking-tight">Diaspora & Community Investment</h3>
          <p className="text-[14px] text-slate-400 leading-[1.7] mb-5">
            Enable communities, diaspora networks, and micro-investors to co-finance energy
            projects in their home regions. OEI Nexus provides fractional investment instruments
            starting from $100, with full transparency and impact tracking.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="green">💳 From $100</Badge>
            <Badge variant="teal">🌍 60+ Countries</Badge>
            <Badge variant="blue">📊 Impact Tracked</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          {CROWD_STATS.map(([v, l]) => (
            <div key={l} className="rounded-xl p-4 text-center"
                 style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.10)' }}>
              <div className="text-[22px] font-extrabold text-brand-green3 tracking-tight">{v}</div>
              <div className="text-[11.5px] text-slate-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
