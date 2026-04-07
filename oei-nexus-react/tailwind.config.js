/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020B18',
          900: '#071628',
          800: '#0D2545',
          700: '#0F3460',
        },
        brand: {
          blue:  '#1565C0',
          teal:  '#009688',
          teal2: '#26A69A',
          teal3: '#4DB6AC',
          teal4: '#00796B',
          green:  '#2E7D32',
          green2: '#4CAF50',
          green3: '#81C784',
          accent: '#00E676',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.6', transform: 'scale(1.4)' },
        },
        ringSpin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        cubeFloat: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        nodePulse: {
          '0%,100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.05)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        markerPing: {
          '0%,100%': { boxShadow: '0 0 8px rgba(0,150,136,0.6)' },
          '50%':     { boxShadow: '0 0 24px rgba(0,150,136,0.9),0 0 48px rgba(0,150,136,0.3)' },
        },
      },
      animation: {
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
        'ring':         'ringSpin 20s linear infinite',
        'ring-reverse': 'ringSpin 15s linear infinite reverse',
        'cube-float':   'cubeFloat 4s ease-in-out infinite',
        'node-pulse':   'nodePulse 3s ease-in-out infinite',
        'fade-in-up':   'fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
        'marker-ping':  'markerPing 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4,0,0.2,1)',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        'hero-glow': `
          radial-gradient(ellipse 80% 60% at 70% 20%, rgba(0,150,136,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 20% 70%, rgba(21,101,192,0.10) 0%, transparent 60%)
        `,
        'score-gradient': 'linear-gradient(135deg, #009688, #00E676)',
        'primary-gradient': 'linear-gradient(135deg, #009688, #1565C0)',
        'teal-gradient': 'linear-gradient(135deg, #26A69A, #00E676)',
      },
    },
  },
  plugins: [],
}
