/** OEI score evolution sparkline with gradient fill */
export default function TimelineChart() {
  const labels = ['Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Now']
  const dots = [[0,100],[160,88],[320,76],[480,64],[640,52],[800,41],[1000,28]]

  return (
    <div style={{ height: 120, position: 'relative' }}>
      <svg width="100%" height="120" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(0,150,136,0.3)" />
            <stop offset="100%" stopColor="rgba(0,150,136,0.02)" />
          </linearGradient>
        </defs>

        <path
          d="M0,100 Q80,95 160,88 Q240,82 320,76 Q400,70 480,64 Q560,58 640,52 Q720,46 800,41 Q880,36 960,30 L1000,28 L1000,120 L0,120 Z"
          fill="url(#timelineGrad)"
        />
        <path
          d="M0,100 Q80,95 160,88 Q240,82 320,76 Q400,70 480,64 Q560,58 640,52 Q720,46 800,41 Q880,36 960,30 L1000,28"
          fill="none" stroke="#009688" strokeWidth="2.5"
        />

        {dots.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx} cy={cy}
            r={i === dots.length - 1 ? 5 : 4}
            fill={i === dots.length - 1 ? '#00E676' : '#009688'}
            stroke={i === dots.length - 1 ? '#009688' : 'none'}
            strokeWidth={i === dots.length - 1 ? 2 : 0}
          />
        ))}

        {/* Quarter labels */}
        {labels.map((lbl, i) => {
          const positions = [0, 145, 305, 465, 625, 785, 975]
          const anchors   = ['start','start','start','start','start','start','end']
          return (
            <text
              key={lbl}
              x={positions[i]} y="116"
              fill="rgba(255,255,255,0.25)"
              fontSize="12"
              fontFamily="Inter,sans-serif"
              textAnchor={anchors[i]}
            >
              {lbl}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
