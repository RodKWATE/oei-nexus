import { cn } from '../../lib/utils'

export default function GlassCard({ children, className, hover = true, padding = 'p-7', onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl',
        hover && 'glass-hover',
        onClick && 'cursor-pointer',
        padding,
        className
      )}
    >
      {children}
    </div>
  )
}
