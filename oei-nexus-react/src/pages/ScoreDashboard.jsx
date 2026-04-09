import { useState } from 'react'
import Badge from '../components/ui/Badge'
import GlassCard from '../components/ui/GlassCard'
import DimCard from '../components/ui/DimCard'
import RadarChart from '../components/charts/RadarChart'
import { useApi } from '../hooks/useApi'
import { projectsApi, assessmentsApi } from '../lib/api'
import { DIMENSIONS, INSIGHTS } from '../data/mockData'

const DIM_META = {
  digitalization: { id: 'digital',    icon: '💻', name: 'Digitalization', color: '#4DB6AC', gradient: 'linear-gradient(90deg,#009688,#4DB6AC)', bg: 'rgba(0,150,136,0.15)',  border: 'rgba(0,150,136,0.3)' },
  sdg7:           { id: 'sdg7',       icon: '⚡', name: 'SDG7 Alignment', color: '#90CAF9', gradient: 'linear-gradient(90deg,#1565C0,#90CAF9)', bg: 'rgba(21,101,192,0.15)', border: 'rgba(21,101,192,0.3)' },
  finance:        { id: 'finance',    icon: '💹', name: 'Finance',         color: '#81C784', gradient: 'linear-gradient(90deg,#2E7D32,#81C784)', bg: 'rgba(76,175,80,0.15)',  border: 'rgba(76,175,80,0.3)' },
  inclusion:      { id: 'inclusion',  icon: '🤝', name: 'Inclusion',       color: '#00E676', gradient: 'linear-gradient(90deg,#009688,#00E676)', bg: 'rgba(0,150,136,0.15)',  border: 'rgba(0,150,136,0.3)' },
  governance:     { id: 'governance', icon: '🏛️', name: 'Governance',      color: '#CE93D8', gradient: 'linear-gradient(90deg,#7B1FA2,#CE93D8)', bg: 'rgba(156,39,176,0.15)', border: 'rgba(156,39,176,0.3)' },
  impact:         { id: 'impact',     icon: '🌱', name: 'Impact',          color: '#FFCC02', gradient: 'linear-gradient(90deg,#E65100,#FFCC02)', bg: 'rgba(255,152,0,0.15)',  border: 'rgba(255,152,0,0.3)' },
}

const LEVEL_STYLE = {
  Platinum: { bg: 'rgba(255,213,79,0.12)', border: 'rgba(255,213,79,0.25)', color: '#FFD54F' },
  Gold:     { bg: 'rgba(255,193,7,0.12)',  border: 'rgba(255,193,7,0.25)',  color: '#FFD54F' },
  Silver:   { bg: 'rgba(144,202,249,0.12)',border: 'rgba(144,202,249,0.25)',color: '#90CAF9' },
  Bronze:   { bg: 'rgba(206,147,216,0.12)',border: 'rgba(206,147,216,0.25)',color: '#CE93D8' },
}

function ScoreRing({ score = 78 }) {
  const pct = Math.min(100, Math.max(0, score))
  const circumference = 2 * Math.PI * 55
  const offset = circumference * (1 - pct / 100)
  return (
    <div className="relative w-[140px] h-[140px] flex-shrink-0">
      <svg style={{ transform:'rotate(-90deg)', width:140, height:140 }} viewBox="0 0 140 140">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#009688" />
            <stop offset="100%" stopColor="#00E676" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="70" cy="70" r="55" fill="none"
          stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[38px] font-black tracking-[-2px] leading-none gradient-text-score">{score}</span>
        <span className="text-[13px] text-slate-500 mt-0.5">/100</span>
      </div>
    </div>
  )
}

export default function ScoreDashboard() {
  const { data: projects } = useApi(projectsApi.list, { fallback: [] })

  const [selectedId, setSelectedId] = useState(null)
  const projectId = selectedId ?? projects?.[0]?.id

  const { data: assessments } = useApi(
    () => projectId ? assessmentsApi.listForProject(projectId) : Promise.resolve([]),
    { deps: [projectId], fallback: [], enabled: !!projectId }
  )

  const project    = projects?.find((p) => p.id === projectId)
  const assessment = Array.isArray(assessments) ? assessments[0] : null

  // Build dimension cards from real assessment or fall back to mock
  const dimensions = assessment?.dimension_scores
    ? Object.entries(assessment.dimension_scores).map(([key, score]) => {
        const meta = DIM_META[key] ?? DIM_META.impact
        return { ...meta, score: Math.round(score * 100), change: 0 }
      })
    : DIMENSIONS

  const oeiScore = assessment?.total_score ? Math.round(assessment.total_score) : 78
  const oeiLevel = assessment?.oei_level ?? project?.oei_level ?? 'Gold'
  const levelStyle = LEVEL_STYLE[oeiLevel] ?? LEVEL_STYLE.Gold

  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Page header */}
      <div className="flex items-center justify-between py-10 border-b border-white/10 mb-9">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">OEI Score Dashboard</h1>
          <p className="text-[14.5px] text-slate-500 mt-1.5">Multidimensional evaluation of energy inclusion performance</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={projectId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white
                         focus:outline-none focus:border-brand-teal/50 cursor-pointer">
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background:'#071628' }}>{p.name}</option>
              ))}
            </select>
          )}
          <Badge variant="green">● Live Analysis</Badge>
          <Badge variant="teal">v2.4 Engine</Badge>
        </div>
      </div>

      {/* Score hero */}
      <div className="relative overflow-hidden rounded-3xl mb-6 flex items-center gap-10 p-9"
           style={{ background:'linear-gradient(135deg,rgba(0,150,136,0.12),rgba(21,101,192,0.12))', border:'1px solid rgba(0,150,136,0.25)' }}>
        <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
             style={{ background:'radial-gradient(circle,rgba(0,230,118,0.08) 0%,transparent 70%)' }} />
        <ScoreRing score={oeiScore} />
        <div className="flex-1">
          <h2 className="text-[22px] font-bold mb-2 tracking-tight">
            {project?.name ?? 'SolarGrid West Africa Initiative'}
          </h2>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {[
              project?.country ? `🌍 ${project.country}` : '🌍 Senegal, Mali, Guinea',
              project?.project_type ? `⚡ ${project.project_type}` : '⚡ Solar + Mini-Grid',
              project?.investment_usd ? `💰 $${(project.investment_usd / 1e6).toFixed(0)}M` : '💰 $48M',
            ].map((t) => (
              <span key={t} className="text-[12.5px] text-slate-400">{t}</span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[14px] font-bold"
                style={{ background: levelStyle.bg, border: `1px solid ${levelStyle.border}`, color: levelStyle.color }}>
            ✦ {oeiLevel} Level — OEI Certified
          </span>
        </div>
        <div className="flex flex-col gap-3 flex-shrink-0">
          <button className="w-[200px] py-3 px-4 rounded-lg text-[13.5px] font-semibold text-white
                             flex items-center justify-center gap-2 btn-gradient">
            ⬇ Download PDF Report
          </button>
          <button className="w-[200px] py-2.5 px-4 rounded-lg text-[13px] font-semibold
                             border border-[rgba(0,150,136,0.3)] text-brand-teal2 bg-transparent
                             hover:bg-[rgba(0,150,136,0.1)] transition-colors">
            🔗 Share Profile
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-7" style={{ gridTemplateColumns:'1fr 380px' }}>

        {/* Left column */}
        <div>
          {/* Radar */}
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold">Dimension Analysis</h3>
              <div className="flex gap-2.5">
                <Badge variant="teal">This Project</Badge>
                <Badge variant="ghost">Regional Avg.</Badge>
              </div>
            </div>
            <RadarChart />
          </GlassCard>

          {/* Dimension cards */}
          <div className="grid grid-cols-3 gap-3.5 mb-6">
            {dimensions.map((d) => <DimCard key={d.id} {...d} />)}
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl p-6"
               style={{ background:'linear-gradient(135deg,rgba(0,150,136,0.08),rgba(21,101,192,0.08))', border:'1px solid rgba(0,150,136,0.2)' }}>
            <div className="flex items-center gap-2.5 mb-4.5">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] btn-gradient"
                   style={{ boxShadow:'0 4px 16px rgba(0,150,136,0.3)' }}>🤖</div>
              <div>
                <div className="text-[15px] font-bold">AI Insights</div>
                <div className="text-xs text-slate-500">Powered by OEI Intelligence Engine v2.4</div>
              </div>
            </div>
            {(assessment?.recommendations?.length
              ? assessment.recommendations.map((r, i) => ({ color: '#4CAF50', text: r }))
              : INSIGHTS
            ).map((ins, i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-white/10 last:border-0">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ins.color }} />
                <p className="text-[13px] text-slate-300 leading-[1.55]"
                   dangerouslySetInnerHTML={{ __html: ins.text.replace(/<strong>/g,"<strong class='text-brand-teal3 font-semibold'>") }} />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <GlassCard>
            <h4 className="text-[14px] font-bold text-slate-300 mb-3.5">Project Summary</h4>
            {[
              ['Project ID',   project ? `#OEI-${String(project.id).padStart(4,'0')}` : '#OEI-2024-0847'],
              ['Evaluator',    'OEI AI Engine'],
              ['Last Updated', assessment?.created_at ? new Date(assessment.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : 'Apr 6, 2026'],
              ['Certification', `✦ ${oeiLevel}`, levelStyle.color],
              ['Budget',       project?.investment_usd ? `$${(project.investment_usd / 1e6).toFixed(1)}M` : '$48M'],
              ['Beneficiaries', project?.households_connected ? `${(project.households_connected / 1e3).toFixed(0)}k people` : '1.2M people'],
              ['CO₂ Reduction', project?.co2_avoided_tonnes_yr ? `−${(project.co2_avoided_tonnes_yr / 1e3).toFixed(0)}k t/yr` : '−24,000 t/yr', '#81C784'],
            ].map(([lbl, val, color]) => (
              <div key={lbl} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0 text-[13px]">
                <span className="text-slate-500">{lbl}</span>
                <span className="font-semibold text-slate-200" style={color ? { color } : {}}>{val}</span>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h4 className="text-[14px] font-bold text-slate-300 mb-2">Score History</h4>
            <svg width="100%" height="80" viewBox="0 0 300 80">
              <polyline points="0,70 50,60 100,52 150,48 200,42 250,36 300,28" fill="none" stroke="rgba(0,150,136,0.3)" strokeWidth="2"/>
              <polyline points="0,70 50,60 100,52 150,48 200,42 250,36 300,28" fill="none" stroke="rgba(0,230,118,0.8)" strokeWidth="2.5"/>
              <circle cx="300" cy="28" r="4" fill="#00E676"/>
            </svg>
            <div className="flex justify-between text-[11px] text-slate-600 mt-1">
              <span>Jan 24</span><span>Apr 24</span><span>Jul 24</span><span>Now</span>
            </div>
          </GlassCard>

          <button className="w-full py-3 rounded-lg text-[13.5px] font-semibold text-white
                             flex items-center justify-center gap-2 btn-gradient">
            ⬇ Download PDF Report
          </button>

          <GlassCard>
            <h4 className="text-[14px] font-bold text-slate-300 mb-3">Score vs. Average</h4>
            {[
              ['This Project',   `${oeiScore} pts`, '#26A69A'],
              ['Regional Avg.',  '61 pts',          null],
              ['Global Top 10%', '88+ pts',         '#FFD54F'],
            ].map(([lbl, val, color]) => (
              <div key={lbl} className="flex justify-between items-center text-[12.5px] mb-2">
                <span className="text-slate-400">{lbl}</span>
                <span className="font-bold" style={color ? { color } : { color: '#64748B' }}>{val}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
