export default function ProgressBar({ value, gradient, height = 'h-1.5', className = '' }) {
  return (
    <div className={`w-full bg-white/[0.07] rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: gradient }}
      />
    </div>
  )
}
