import { cn } from '../../lib/utils'

export default function Button({ children, variant = 'primary', className, onClick, style }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer'

  const variants = {
    primary: 'px-7 py-3.5 text-[15px] text-white btn-gradient',
    secondary: 'px-7 py-3.5 text-[15px] text-white bg-white/5 border border-white/10 backdrop-blur-md hover:border-brand-teal hover:bg-[rgba(0,150,136,0.08)] hover:-translate-y-0.5',
    ghost: 'px-4.5 py-2 text-[13.5px] text-slate-300 border border-white/10 hover:text-white hover:border-brand-teal bg-transparent',
    small: 'px-4 py-2 text-[13px] text-white btn-gradient',
    outline: 'w-full px-4 py-2.5 text-[13px] font-semibold text-brand-teal2 border border-[rgba(0,150,136,0.3)] bg-transparent hover:bg-[rgba(0,150,136,0.1)] hover:border-brand-teal2 hover:text-white',
  }

  return (
    <button
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      style={style}
    >
      {children}
    </button>
  )
}
