import Button from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { metricsApi } from '../lib/api'
import { HERO_STATS } from '../data/mockData'

function formatNum(n) {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return String(n)
}

const DIM_NODES = [
  { icon: '💻', label: 'Digital',  style: { top: 0, left: '50%', transform: 'translateX(-50%)',       background: 'rgba(0,150,136,0.2)',   border: '1px solid rgba(0,150,136,0.4)' }, delay: '0s' },
  { icon: '⚡', label: 'SDG7',    style: { top: '18%', right: 0,                                       background: 'rgba(21,101,192,0.2)',  border: '1px solid rgba(21,101,192,0.4)' }, delay: '0.5s' },
  { icon: '💹', label: 'Finance', style: { bottom: '18%', right: 0,                                    background: 'rgba(76,175,80,0.2)',   border: '1px solid rgba(76,175,80,0.4)' }, delay: '1s' },
  { icon: '🤝', label: 'Include', style: { bottom: 0, left: '50%', transform: 'translateX(-50%)',      background: 'rgba(0,150,136,0.2)',   border: '1px solid rgba(0,150,136,0.4)' }, delay: '1.5s' },
  { icon: '🏛️', label: 'Govern', style: { bottom: '18%', left: 0,                                      background: 'rgba(156,39,176,0.2)', border: '1px solid rgba(156,39,176,0.4)' }, delay: '2s' },
  { icon: '🌱', label: 'Impact',  style: { top: '18%', left: 0,                                        background: 'rgba(255,152,0,0.2)',   border: '1px solid rgba(255,152,0,0.4)' }, delay: '2.5s' },
]

const FEATURES = [
  { icon: '📊', title: 'OEI Score Engine',     desc: 'AI-powered 6-dimension scoring across governance, inclusion, and impact.' },
  { icon: '🌐', title: 'Real-time Monitoring', desc: 'Live dashboards tracking CO₂, energy output, and beneficiary reach.' },
  { icon: '💰', title: 'Finance Matching',     desc: 'Connect projects with aligned investors using OEI-based compatibility scoring.' },
  { icon: '🤖', title: 'AI Advisory',          desc: 'Conversational AI to diagnose weaknesses and recommend interventions.' },
]

const PARTNERS = ['🌐 United Nations', '🏦 World Bank', '🌍 African Dev. Bank', '⚡ IRENA', '🤝 UNDP', '📊 IFC', '🏛️ UNECE']

export default function Home({ navigate }) {
  const { data: agg } = useApi(metricsApi.aggregate, { fallback: null })

  // Build stats from real data when available, fall back to mock
  const stats = agg
    ? [
        { value: String(agg.projects_count),                  label: 'Projects Evaluated' },
        { value: String(agg.countries_count),                 label: 'Countries' },
        { value: formatNum(agg.total_investment_usd),         label: 'Capital Mobilized' },
        { value: formatNum(agg.total_households_connected),   label: 'Lives Impacted' },
      ]
    : HERO_STATS

  return (
    <div className="relative z-10">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center py-[88px] pb-16">
        <div className="max-w-[1280px] mx-auto px-10 w-full">
          <div className="grid grid-cols-2 gap-20 items-center">

            {/* Left */}
            <div>
              <div className="flex items-center gap-2.5 mb-6 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse-dot"
                      style={{ boxShadow: '0 0 12px #00E676' }} />
                <span className="text-[12.5px] font-semibold tracking-[1.5px] uppercase text-brand-teal2">
                  Global Energy Inclusion Platform
                </span>
              </div>

              <h1 className="text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.1] tracking-[-1.5px] mb-6
                             animate-fade-in-up animation-delay-100">
                The Operating System for<br />
                <span className="gradient-text">Inclusive Energy Transition</span>
              </h1>

              <p className="text-[17px] leading-[1.75] text-slate-400 mb-9 max-w-[520px]
                            animate-fade-in-up animation-delay-200">
                OEI Nexus combines <strong className="text-slate-200 font-semibold">digitalization</strong>,{' '}
                <strong className="text-slate-200 font-semibold">finance intelligence</strong>, and{' '}
                <strong className="text-slate-200 font-semibold">social inclusion scoring</strong> into one unified
                platform — enabling governments, investors, and communities to evaluate, fund, and track energy
                transformation globally.
              </p>

              <div className="flex gap-3.5 flex-wrap mb-14 animate-fade-in-up animation-delay-300">
                <Button variant="primary" onClick={() => navigate('score')}>⚡ Evaluate a Project</Button>
                <Button variant="secondary" onClick={() => navigate('explorer')}>🌍 Explore Global Projects →</Button>
              </div>

              <div className="flex gap-8 flex-wrap animate-fade-in-up animation-delay-400">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-[26px] font-extrabold tracking-tight gradient-text-score">{s.value}</div>
                    <div className="text-[12.5px] text-slate-500 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — OEI Visual */}
            <div className="hero-visual flex justify-center items-center transition-transform duration-75">
              <div className="relative w-[340px] h-[340px]">

                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-[rgba(0,150,136,0.15)] animate-ring" />
                <div className="absolute top-10 left-10 right-10 bottom-10 rounded-full
                                border border-[rgba(21,101,192,0.15)] animate-ring-reverse" />

                {/* Dimension nodes */}
                {DIM_NODES.map((n) => (
                  <div
                    key={n.label}
                    className="absolute w-[52px] h-[52px] rounded-xl flex flex-col items-center
                               justify-center gap-0.5 text-[9px] font-semibold tracking-[0.3px]
                               uppercase text-slate-300 border backdrop-blur-sm animate-node-pulse"
                    style={{ ...n.style, animationDelay: n.delay }}
                  >
                    <span className="text-[18px]">{n.icon}</span>
                    {n.label}
                  </div>
                ))}

                {/* Center cube */}
                <div
                  className="absolute top-20 left-20 right-20 bottom-20 rounded-2xl
                             flex flex-col items-center justify-center gap-1.5
                             animate-cube-float backdrop-blur-xl"
                  style={{
                    background: 'linear-gradient(135deg,rgba(0,150,136,0.25),rgba(21,101,192,0.25))',
                    border: '1px solid rgba(0,150,136,0.4)',
                    boxShadow: '0 0 60px rgba(0,150,136,0.2),inset 0 0 40px rgba(0,150,136,0.05)',
                  }}
                >
                  <div className="text-[42px] font-black tracking-[-2px] leading-none gradient-text-score">78</div>
                  <div className="text-[11px] font-semibold text-brand-teal2 tracking-[1px] uppercase">OEI Score</div>
                  <div className="text-[10px] text-slate-500 font-medium">Gold Level ✦</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features strip ─────────────────────────────────────── */}
      <div className="relative z-10 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="grid grid-cols-4">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`flex items-start gap-4 py-7 px-8 ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0"
                     style={{ background:'linear-gradient(135deg,rgba(0,150,136,0.2),rgba(21,101,192,0.2))', border:'1px solid rgba(0,150,136,0.2)' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-[14px] font-bold mb-1">{f.title}</div>
                  <div className="text-[13px] text-slate-500 leading-[1.55]">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Partners ───────────────────────────────────────────── */}
      <div className="relative z-10 py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <p className="text-center text-xs font-semibold tracking-[1.5px] uppercase text-slate-600 mb-8">
            Trusted by global institutions
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {PARTNERS.map((p) => (
              <span key={p} className="text-[13px] font-bold text-slate-600 tracking-[0.5px] opacity-60
                                       hover:opacity-100 hover:text-brand-teal2 transition-all duration-200 cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center py-10 text-[12.5px] text-slate-600 border-t border-white/10 mt-16">
        OEI Nexus — Open Energy Inclusion Platform &nbsp;•&nbsp;
        Built for a <span className="text-brand-teal4 font-semibold">sustainable</span> future
      </footer>
    </div>
  )
}
