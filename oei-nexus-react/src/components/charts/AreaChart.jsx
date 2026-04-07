/** Two-layer area chart (Solar + Wind) over 12 months */
export default function AreaChart() {
  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']

  return (
    <div>
      <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width:'100%', height:200 }}>
        <defs>
          <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(0,150,136,0.5)" />
            <stop offset="100%" stopColor="rgba(0,150,136,0.02)" />
          </linearGradient>
          <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(25,118,210,0.4)" />
            <stop offset="100%" stopColor="rgba(25,118,210,0.02)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0,45,90,135,180].map((y) => (
          <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {/* Solar fill */}
        <path
          d="M0,140 L50,130 L100,120 L150,110 L200,105 L250,90 L300,85 L350,70 L400,65 L450,55 L500,48 L550,40 L600,34 L600,180 L0,180 Z"
          fill="url(#solarGrad)"
        />
        <path
          d="M0,140 L50,130 L100,120 L150,110 L200,105 L250,90 L300,85 L350,70 L400,65 L450,55 L500,48 L550,40 L600,34"
          fill="none" stroke="#009688" strokeWidth="2"
        />

        {/* Wind fill */}
        <path
          d="M0,160 L50,152 L100,148 L150,140 L200,135 L250,128 L300,122 L350,118 L400,112 L450,105 L500,100 L550,94 L600,88 L600,180 L0,180 Z"
          fill="url(#windGrad)"
        />
        <path
          d="M0,160 L50,152 L100,148 L150,140 L200,135 L250,128 L300,122 L350,118 L400,112 L450,105 L500,100 L550,94 L600,88"
          fill="none" stroke="#1976D2" strokeWidth="1.5"
        />

        {/* Latest data points */}
        <circle cx="600" cy="34" r="4" fill="#009688" />
        <circle cx="600" cy="88" r="3" fill="#1976D2" />
      </svg>

      <div className="flex justify-between text-[10.5px] text-slate-600 mt-1.5 px-1">
        {months.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  )
}
