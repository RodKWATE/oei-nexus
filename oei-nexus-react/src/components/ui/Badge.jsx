import { cn } from '../../lib/utils'

const VARIANTS = {
  teal:  'bg-[rgba(0,150,136,0.15)] text-brand-teal3 border border-[rgba(0,150,136,0.25)]',
  green: 'bg-[rgba(76,175,80,0.12)] text-brand-green3 border border-[rgba(76,175,80,0.2)]',
  blue:  'bg-[rgba(21,101,192,0.15)] text-[#90CAF9] border border-[rgba(21,101,192,0.25)]',
  gold:  'bg-[rgba(255,193,7,0.12)] text-[#FFD54F] border border-[rgba(255,193,7,0.2)]',
  ghost: 'bg-white/5 text-slate-400 border border-white/10',
}

export default function Badge({ children, variant = 'teal', className, style }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-semibold',
        'tracking-[0.5px] uppercase',
        VARIANTS[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  )
}
