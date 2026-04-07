import { useState, useRef, useEffect } from 'react'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import { INITIAL_MESSAGES, AI_DIMENSION_SCORES, AI_RECOMMENDATIONS } from '../data/mockData'

function ChatMessage({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex flex-row-reverse gap-3 items-start">
        <div className="w-[34px] h-[34px] rounded-[10px] bg-white/10 flex items-center justify-center text-[16px] flex-shrink-0">👤</div>
        <div className="max-w-[75%] px-4 py-3 rounded-[14px_4px_14px_14px] text-[13.5px] leading-relaxed text-white"
             style={{ background:'linear-gradient(135deg,rgba(0,150,136,0.25),rgba(21,101,192,0.25))', border:'1px solid rgba(0,150,136,0.25)' }}>
          {msg.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 items-start">
      <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px] flex-shrink-0 btn-gradient">🤖</div>
      <div className="max-w-[75%] px-4 py-3 text-[13.5px] leading-relaxed text-slate-200"
           style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'4px 14px 14px 14px' }}>
        {msg.scoreEstimate ? (
          <>
            <p className="mb-3" dangerouslySetInnerHTML={{ __html: msg.text }} />
            <div className="p-3.5 rounded-lg mb-3" style={{ background:'rgba(0,150,136,0.1)', border:'1px solid rgba(0,150,136,0.2)' }}>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.5px] mb-1">Estimated OEI Score</div>
              <div className="text-[28px] font-black text-brand-teal2 tracking-tight leading-none">{msg.score} / 100</div>
              <div className="text-xs text-slate-400 mt-1">{msg.level}</div>
            </div>
            <p className="mb-2 text-[13px]">Key weaknesses identified:</p>
            <div className="flex flex-wrap gap-1.5">
              {msg.weaknesses.map((w) => (
                <span key={w} className="px-2.5 py-1 rounded text-[11.5px] font-semibold"
                      style={{ background:'rgba(239,154,154,0.1)', border:'1px solid rgba(239,154,154,0.2)', color:'#EF9A9A' }}>
                  {w}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/<strong>/g,"<strong style='color:#4DB6AC;font-weight:600'>") }} />
        )}
      </div>
    </div>
  )
}

export default function AiAdvisor() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('What financing instruments are available for a Gold-level OEI project in Sub-Saharan Africa?')
  const messagesEndRef = useRef(null)

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Analyzing your query against the OEI financing framework... For a Gold-level project in Sub-Saharan Africa, you have access to: <strong>Concessional DFI loans</strong> (AfDB, IFC), <strong>Green bonds</strong> (IDA-backed), <strong>Blended finance</strong> through GCERF or SEFA, and <strong>Diaspora bonds</strong> specifically targeting the African diaspora in Europe and North America.'
      }])
    }, 1000)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="max-w-[1280px] mx-auto px-10 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between py-10 border-b border-white/10 mb-7">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">AI Advisor</h1>
          <p className="text-[14.5px] text-slate-500 mt-1.5">Describe your project — receive instant OEI score estimate and recommendations</p>
        </div>
        <Badge variant="teal">● Model v2.4 — Online</Badge>
      </div>

      <div className="grid gap-7" style={{ gridTemplateColumns:'1fr 420px' }}>

        {/* Chat panel */}
        <div className="glass rounded-3xl flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3.5 p-5 border-b border-white/10">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl btn-gradient flex-shrink-0"
                 style={{ boxShadow:'0 4px 20px rgba(0,150,136,0.35)' }}>🤖</div>
            <div>
              <div className="text-[15px] font-bold">OEI Intelligence Engine</div>
              <div className="flex items-center gap-1.5 text-xs text-brand-teal2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse-dot"
                     style={{ boxShadow:'0 0 8px #00E676' }} />
                Online — responds instantly
              </div>
            </div>
            <button className="ml-auto px-3.5 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10
                               bg-white/5 hover:text-white hover:border-brand-teal transition-colors">
              🔄 New Session
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4.5" style={{ minHeight:400 }}>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2.5 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                rows={2}
                placeholder="Describe your project or ask a question..."
                className="flex-1 px-4 py-3 rounded-xl text-[13.5px] text-white resize-none outline-none
                           placeholder:text-slate-600 transition-colors focus:border-brand-teal"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)',
                         minHeight:48, maxHeight:120 }}
              />
              <button
                onClick={handleSend}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-white
                           btn-gradient flex-shrink-0 hover:scale-105 transition-transform"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="flex flex-col gap-4.5">
          {/* Score estimate */}
          <div className="glass rounded-2xl p-5.5" style={{ padding:22 }}>
            <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-3.5">📊 Score Estimate</div>
            <div className="flex items-center gap-5 mb-4">
              <span className="text-[48px] font-black text-brand-teal2 tracking-[-2px] leading-none">71</span>
              <div>
                <div className="text-[14px] font-bold" style={{ color:'#FFD54F' }}>✦ Gold Level</div>
                <div className="text-xs text-slate-500 mt-1">Top 35% globally</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {AI_DIMENSION_SCORES.map((d) => (
                <div key={d.name} className="flex justify-between items-center text-[12.5px]">
                  <span className="text-slate-400">{d.icon} {d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${d.pct}%`, background: d.color }} />
                    </div>
                    <span className="font-bold text-xs" style={{ color: d.color }}>{d.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass rounded-2xl" style={{ padding:22 }}>
            <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-3.5">🛠 Top Recommendations</div>
            {AI_RECOMMENDATIONS.map((r, i) => (
              <div key={i} className="flex gap-2.5 py-2.5 border-b border-white/[0.05] last:border-0 text-[13px] text-slate-300 leading-[1.55]">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                     style={{ background:'rgba(0,150,136,0.15)', border:'1px solid rgba(0,150,136,0.2)', color:'#26A69A' }}>
                  {i + 1}
                </div>
                <span>{r.text} — <strong className="text-brand-teal2 font-semibold">{r.points}</strong></span>
              </div>
            ))}
          </div>

          {/* Potential */}
          <div className="rounded-2xl p-5.5" style={{ padding:22, background:'linear-gradient(135deg,rgba(0,150,136,0.08),rgba(76,175,80,0.06))', border:'1px solid rgba(0,150,136,0.2)' }}>
            <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-3">🎯 Potential Score</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[36px] font-black tracking-[-1.5px] text-brand-accent">91</span>
              <div>
                <div className="text-[13px] font-bold text-slate-200">✦ Platinum Level</div>
                <div className="text-xs text-slate-500">With recommended actions</div>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white btn-gradient">
              Generate Full OEI Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
