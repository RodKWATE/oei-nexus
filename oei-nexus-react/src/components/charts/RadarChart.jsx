/**
 * Pure SVG radar chart for 6 OEI dimensions.
 * cx/cy is the center; r is the max radius.
 */
export default function RadarChart() {
  return (
    <div className="flex justify-center items-center" style={{ height: 320 }}>
      <svg width="320" height="300" viewBox="0 0 320 300" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,150,136,0.35)" />
            <stop offset="100%" stopColor="rgba(0,230,118,0.15)" />
          </linearGradient>
        </defs>

        {/* Grid rings */}
        {[110, 82, 55, 27].map((r) => (
          <circle key={r} cx="160" cy="148" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {[
          [160,148,160,38], [160,148,255,95], [160,148,255,200],
          [160,148,160,258],[160,148,65,200], [160,148,65,95],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}

        {/* Regional average (dashed) */}
        <polygon
          points="160,88 216,113 221,179 160,218 99,179 104,113"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />

        {/* Project score polygon */}
        <polygon
          points="160,54 246,112 230,214 160,238 90,214 74,112"
          fill="url(#radarFill)"
          stroke="rgba(0,230,118,0.6)"
          strokeWidth="2"
        />

        {/* Data points */}
        {[[160,54],[246,112],[230,214],[160,238],[90,214],[74,112]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#00E676" />
        ))}

        {/* Labels */}
        <text x="160" y="26"  textAnchor="middle" fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">Digitalization</text>
        <text x="272" y="98"  textAnchor="start"  fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">SDG7</text>
        <text x="272" y="228" textAnchor="start"  fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">Finance</text>
        <text x="160" y="280" textAnchor="middle" fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">Inclusion</text>
        <text x="50"  y="228" textAnchor="end"    fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">Governance</text>
        <text x="50"  y="98"  textAnchor="end"    fill="#4DB6AC" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">Impact</text>
      </svg>
    </div>
  )
}
