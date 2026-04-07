import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import ProgressBar from '../components/ui/ProgressBar'
import { COURSES } from '../data/mockData'

const CERT_BADGES = [
  { icon: '🌱', name: 'OEI Practitioner',  sub: 'Foundation · 2,847 issued' },
  { icon: '⚡', name: 'OEI Architect',     sub: 'Professional · 641 issued' },
  { icon: '🏛️', name: 'OEI Expert Advisor',sub: 'Expert · 128 issued' },
  { icon: '🏆', name: 'OEI Master Fellow', sub: 'Honour · 14 issued' },
]

const LEARNER_PROGRESS = [
  { name: 'OEI Practitioner',    pct: 72, current: 'Module 6 of 8 — Inclusion Frameworks' },
  { name: 'Green Finance & OEI', pct: 28, current: 'Module 3 of 10 — Blended Finance' },
]

const ACHIEVEMENTS = [
  { icon: '🏅', name: 'First Module Complete', sub: 'Earned Mar 12, 2026', locked: false },
  { icon: '🔥', name: '7-Day Streak',          sub: 'Keep going!', locked: false },
  { icon: '🌱', name: 'OEI Practitioner',      sub: '🔒 Locked — 28% remaining', locked: true },
]

export default function Academy() {
  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Hero */}
      <div className="rounded-3xl p-12 mb-9 text-center"
           style={{ background:'linear-gradient(135deg,rgba(21,101,192,0.12),rgba(0,150,136,0.08))', border:'1px solid rgba(21,101,192,0.2)' }}>
        <Badge variant="blue">🎓 OEI Academy</Badge>
        <h2 className="text-[36px] font-extrabold tracking-[-0.8px] mt-4 mb-3 leading-tight">
          Master the Science of<br /><span className="gradient-text">Inclusive Energy</span>
        </h2>
        <p className="text-[16px] text-slate-400 max-w-[560px] mx-auto mb-7 leading-[1.7]">
          Build expertise in OEI methodology, digital energy systems, and sustainable finance.
          Earn globally recognized certifications aligned with UN and World Bank frameworks.
        </p>
        <div className="flex gap-3.5 justify-center">
          <Button variant="primary">🎓 Enroll Now</Button>
          <Button variant="secondary">📋 View Curriculum</Button>
        </div>
      </div>

      {/* Courses */}
      <h3 className="text-[18px] font-bold mb-5">Certification Tracks</h3>
      <div className="grid grid-cols-3 gap-5.5 mb-9" style={{ gap:22 }}>
        {COURSES.map((c) => (
          <div key={c.title}
            className="glass rounded-2xl overflow-hidden cursor-pointer
                       transition-all duration-200 hover:border-[rgba(0,150,136,0.3)] hover:-translate-y-1
                       hover:shadow-[0_20px_48px_rgba(0,0,0,0.3)]">
            {/* Banner */}
            <div className="h-[120px] flex items-center justify-center text-[44px] relative overflow-hidden"
                 style={{ background: c.bg }}>
              {c.emoji}
              <div className="absolute inset-0" style={{ background:'linear-gradient(180deg,transparent 50%,rgba(7,22,40,0.5) 100%)' }} />
            </div>
            {/* Body */}
            <div className="p-5">
              <div className="text-[11px] font-bold uppercase tracking-[1px] mb-2" style={{ color: c.levelColor }}>
                {c.level}
              </div>
              <div className="text-[16px] font-bold mb-2 leading-[1.3]">{c.title}</div>
              <p className="text-[13px] text-slate-500 leading-[1.6] mb-3.5">{c.desc}</p>
              <div className="flex gap-3.5 text-xs text-slate-500 mb-3.5">
                {c.meta.map((m) => (
                  <span key={m} className="flex items-center gap-1">{m}</span>
                ))}
              </div>
              <button
                className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200
                  ${c.primary
                    ? 'text-white btn-gradient'
                    : 'text-brand-teal2 border border-[rgba(0,150,136,0.3)] bg-transparent hover:bg-[rgba(0,150,136,0.1)] hover:text-white'}`}
              >
                {c.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certification badges */}
      <GlassCard className="mb-7">
        <div className="text-[15px] font-bold mb-4">Certification Badges</div>
        <div className="flex gap-4 flex-wrap">
          {CERT_BADGES.map((b) => (
            <div key={b.name}
              className="flex items-center gap-3 px-5 py-3.5 rounded-lg cursor-pointer
                         transition-all duration-200 border border-white/10 bg-white/[0.03]
                         hover:border-[rgba(255,193,7,0.4)] hover:bg-[rgba(255,193,7,0.05)]">
              <span className="text-[32px]">{b.icon}</span>
              <div>
                <div className="text-[14px] font-bold">{b.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Learner dashboard */}
      <div className="grid gap-5.5" style={{ gridTemplateColumns:'2fr 1fr', gap:22 }}>
        <GlassCard>
          <div className="text-[15px] font-bold mb-4.5">📈 My Learning Progress</div>
          {LEARNER_PROGRESS.map((lp) => (
            <div key={lp.name} className="mb-4 pb-4 border-b border-white/[0.05] last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between mb-2">
                <span className="text-[13.5px] font-semibold">{lp.name}</span>
                <span className="text-[13px] font-bold text-brand-teal2">{lp.pct}%</span>
              </div>
              <ProgressBar value={lp.pct} gradient="linear-gradient(90deg,#009688,#4DB6AC)" height="h-[5px]" />
              <div className="text-[11.5px] text-slate-600 mt-1.5">{lp.current}</div>
            </div>
          ))}
        </GlassCard>

        <GlassCard>
          <div className="text-[14px] font-bold text-slate-300 mb-3.5">Achievements</div>
          <div className="flex flex-col gap-2.5">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.name}
                className={`flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] ${a.locked ? 'opacity-40' : ''}`}>
                <span className="text-[22px]">{a.icon}</span>
                <div>
                  <div className="text-[13px] font-semibold">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
