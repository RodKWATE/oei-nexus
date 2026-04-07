import { NAV_ITEMS } from '../../data/mockData'
import { cn } from '../../lib/utils'

export default function Navbar({ activePage, navigate }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center px-10 gap-10
                    glass-dark border-b border-white/10">
      {/* Logo */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight whitespace-nowrap
                   hover:opacity-80 transition-opacity"
      >
        <span className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center
                         text-base btn-gradient">
          ⬡
        </span>
        OEI <span className="text-brand-teal2">Nexus</span>
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 whitespace-nowrap',
              activePage === item.id
                ? 'text-brand-teal2 bg-white/5'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        <button className="px-4 py-2 rounded-lg text-[13.5px] font-medium text-slate-300
                           border border-white/10 hover:text-white hover:border-brand-teal
                           transition-all duration-200 bg-transparent">
          Sign In
        </button>
        <button className="px-5 py-2 rounded-lg text-[13.5px] font-semibold text-white
                           btn-gradient">
          Get Started
        </button>
      </div>
    </nav>
  )
}
