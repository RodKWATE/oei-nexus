import Badge from '../components/ui/Badge'
import GlassCard from '../components/ui/GlassCard'
import KpiCard from '../components/ui/KpiCard'
import ProgressBar from '../components/ui/ProgressBar'
import AreaChart from '../components/charts/AreaChart'
import TimelineChart from '../components/charts/TimelineChart'
import { KPIS } from '../data/mockData'

const CO2_REGIONS = [
  { label: '🌍 Sub-Saharan Africa', pct: 31, color: '#26A69A', gradient: 'linear-gradient(90deg,#009688,#4DB6AC)' },
  { label: '🌏 South & SE Asia',    pct: 28, color: '#90CAF9', gradient: 'linear-gradient(90deg,#1565C0,#90CAF9)' },
  { label: '🌎 Latin America',      pct: 22, color: '#81C784', gradient: 'linear-gradient(90deg,#2E7D32,#81C784)' },
  { label: '🌍 MENA',              pct: 12, color: '#FFCC02', gradient: 'linear-gradient(90deg,#E65100,#FFCC02)' },
  { label: '🌐 Other',              pct:  7, color: '#64748B', gradient: 'rgba(255,255,255,0.2)' },
]

export default function ImpactDashboard() {
  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between py-10 border-b border-white/10 mb-7">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Live Impact Dashboard</h1>
          <p className="text-[14.5px] text-slate-500 mt-1.5">Real-time global metrics across all OEI-evaluated projects</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="green">● Live — Updated 2s ago</Badge>
          <button className="px-4 py-2 rounded-lg text-[13px] text-slate-300 border border-white/10
                             bg-white/5 hover:text-white hover:border-brand-teal transition-colors">
            ⬇ Export Data
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-5 mb-7">
        {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid mb-7" style={{ gridTemplateColumns:'2fr 1fr', gap:20 }}>
        {/* Area chart */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[15px] font-bold">Global Energy Output (TWh)</div>
              <div className="text-xs text-slate-500 mt-0.5">Monthly — Last 12 months</div>
            </div>
            <div className="flex gap-4">
              {[['#009688','Solar'],['#1976D2','Wind'],['#81C784','Other']].map(([color,label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ background:color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <AreaChart />
        </GlassCard>

        {/* CO2 by region */}
        <GlassCard>
          <div className="mb-5">
            <div className="text-[15px] font-bold">CO₂ Reduction by Region</div>
            <div className="text-xs text-slate-500 mt-0.5">Annual totals</div>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            {CO2_REGIONS.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-[12.5px] mb-1.5">
                  <span className="text-slate-300">{r.label}</span>
                  <span className="font-bold" style={{ color: r.color }}>{r.pct}%</span>
                </div>
                <ProgressBar value={r.pct} gradient={r.gradient} height="h-[5px]" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* OEI Score timeline */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[15px] font-bold">OEI Score Evolution — Portfolio Average</div>
            <div className="text-xs text-slate-500 mt-0.5">Quarterly average across all evaluated projects</div>
          </div>
          <div className="text-[22px] font-extrabold text-brand-teal2">
            76.2 <span className="text-[13px] text-slate-500 font-medium">avg.</span>
          </div>
        </div>
        <TimelineChart />
      </GlassCard>
    </div>
  )
}
