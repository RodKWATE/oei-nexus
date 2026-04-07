/** Merge Tailwind class names conditionally */
export const cn = (...classes) => classes.filter(Boolean).join(' ')

/** Format large numbers */
export const fmt = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}
