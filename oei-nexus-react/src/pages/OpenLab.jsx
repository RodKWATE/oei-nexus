import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import { REPOS, API_ENDPOINTS, CONTRIBUTORS } from '../data/mockData'

const BADGE_VARIANT_MAP = { green:'green', teal:'teal', blue:'blue', gold:'gold' }

const LAB_STATS = [
  ['24','Repositories'], ['1,847','GitHub Stars'], ['312','Contributors'], ['58','Datasets']
]

const COMMUNITY_STATS = [
  ['Total Contributors','312'], ['Open Issues','47'], ['Pull Requests','23'],
  ['Datasets Shared','58'],     ['Countries','41'],
]

export default function OpenLab() {
  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Header banner */}
      <div className="rounded-3xl p-10 mb-8 flex justify-between items-center gap-10"
           style={{ background:'linear-gradient(135deg,rgba(7,22,40,0.95),rgba(15,52,96,0.8))', border:'1px solid rgba(21,101,192,0.2)' }}>
        <div>
          <Badge variant="blue" className="mb-3.5">🧩 Open Lab</Badge>
          <h2 className="text-[28px] font-extrabold tracking-tight mb-2 leading-tight">
            Open Source Infrastructure<br />for Energy Inclusion
          </h2>
          <p className="text-[15px] text-slate-400 leading-[1.7] max-w-[480px]">
            OEI Nexus is built on open data, open code, and open standards. Access datasets,
            APIs, models, and tools — contribute to a global commons for inclusive energy transformation.
          </p>
          <div className="flex gap-2.5 mt-5">
            <Button variant="primary">⭐ Star on GitHub</Button>
            <Button variant="secondary">📦 View Packages</Button>
          </div>
        </div>
        <div className="flex gap-8 flex-shrink-0">
          {LAB_STATS.map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-[28px] font-extrabold text-brand-teal2 tracking-tight">{v}</div>
              <div className="text-xs text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Repos */}
      <h3 className="text-[16px] font-bold mb-4">📁 Featured Repositories</h3>
      <div className="grid grid-cols-3 gap-4.5 mb-7" style={{ gap:18 }}>
        {REPOS.map((r) => (
          <div key={r.name}
            className="glass rounded-2xl p-5.5 cursor-pointer transition-all duration-200
                       hover:border-[rgba(21,101,192,0.4)] hover:-translate-y-0.5 hover:shadow-xl"
            style={{ padding:22 }}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[20px]">{r.icon}</span>
              <span className="text-[15px] font-bold" style={{ color:'#90CAF9' }}>{r.name}</span>
            </div>
            <p className="text-[13px] text-slate-500 leading-[1.6] mb-4">{r.desc}</p>
            <div className="flex items-center gap-3.5 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: r.langColor }} />
                {r.lang}
              </span>
              <span>⭐ {r.stars}</span>
              <span>🍴 {r.forks}</span>
              <Badge variant={BADGE_VARIANT_MAP[r.badgeVariant]} className="text-[10px]" style={{ padding:'2px 8px' }}>
                {r.badge}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* API Reference */}
      <div className="rounded-2xl mb-7 overflow-hidden"
           style={{ background:'rgba(7,22,40,0.8)', border:'1px solid rgba(21,101,192,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06]"
             style={{ padding:'18px 24px' }}>
          <div className="text-[15px] font-bold">🔌 OEI Score API — v2.4</div>
          <div className="flex items-center gap-2">
            <Badge variant="green">● Operational</Badge>
            <button className="px-3.5 py-1.5 rounded-md text-xs text-slate-400 border border-white/10
                               bg-white/5 hover:text-white hover:border-brand-teal transition-colors">
              View Docs
            </button>
          </div>
        </div>
        {API_ENDPOINTS.map((ep) => (
          <div key={ep.path}
            className="flex items-center gap-3.5 px-6 py-3 border-b border-white/[0.04] last:border-0
                       cursor-pointer hover:bg-white/[0.03] transition-colors">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono min-w-[48px] text-center
              ${ep.method === 'GET'
                ? 'bg-[rgba(76,175,80,0.15)] text-[#81C784] border border-[rgba(76,175,80,0.2)]'
                : 'bg-[rgba(33,150,243,0.15)] text-[#90CAF9] border border-[rgba(33,150,243,0.2)]'}`}>
              {ep.method}
            </span>
            <span className="font-mono text-[13px] text-slate-300 flex-1">{ep.path}</span>
            <span className="text-[12.5px] text-slate-600">{ep.desc}</span>
          </div>
        ))}
      </div>

      {/* Community */}
      <div className="grid gap-5.5" style={{ gridTemplateColumns:'2fr 1fr', gap:22 }}>
        <GlassCard>
          <div className="text-[15px] font-bold mb-4">🏆 Top Contributors</div>
          <div className="flex flex-col gap-3">
            {CONTRIBUTORS.map((c) => (
              <div key={c.name}
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                           border border-white/[0.05] bg-white/[0.03]
                           hover:border-[rgba(0,150,136,0.2)] hover:bg-[rgba(0,150,136,0.04)]">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                     style={{ background: c.bg, border:`1px solid ${c.border}` }}>
                  {c.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.action}</div>
                </div>
                <span className="text-xs font-bold text-brand-teal2 bg-[rgba(0,150,136,0.1)] px-2.5 py-0.5 rounded-full">
                  {c.pts}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <GlassCard>
            <h4 className="text-[14px] font-bold text-slate-300 mb-3.5">Community Stats</h4>
            {COMMUNITY_STATS.map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0 text-[13px]">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-200">{val}</span>
              </div>
            ))}
          </GlassCard>
          <button className="w-full py-3 rounded-lg text-[14px] font-semibold text-white btn-gradient">
            🤝 Join the Community
          </button>
        </div>
      </div>

      <footer className="text-center py-10 text-[12.5px] text-slate-600 border-t border-white/10 mt-16">
        OEI Nexus Open Lab — All data and code released under{' '}
        <span className="text-brand-teal4 font-semibold">CC BY 4.0 / MIT License</span>
      </footer>
    </div>
  )
}
