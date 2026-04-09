import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { NAV_ITEMS } from '../../data/mockData'

// ── Login / Register Modal ─────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode]     = useState('login')
  const [form, setForm]     = useState({ email: '', password: '', full_name: '' })
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({ email: form.email, password: form.password, full_name: form.full_name })
      }
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass relative w-full max-w-sm rounded-2xl p-8 z-10 border border-white/10">
        <button onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white text-xl leading-none">×</button>

        <h2 className="text-xl font-bold gradient-text mb-6">
          {mode === 'login' ? 'Sign in to OEI Nexus' : 'Create an account'}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <input value={form.full_name} onChange={set('full_name')} placeholder="Full name"
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                              text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-teal/50" />
          )}
          <input type="email" value={form.email} onChange={set('email')}
                 placeholder="Email" required
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                            text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-teal/50" />
          <input type="password" value={form.password} onChange={set('password')}
                 placeholder="Password" required minLength={8}
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                            text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-teal/50" />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={busy}
                  className="btn-gradient w-full py-2.5 rounded-lg text-sm font-semibold
                             disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          {mode === 'login' ? "No account? " : 'Have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                  className="text-brand-teal hover:underline">
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────────────────────────
export default function Navbar({ activePage, navigate }) {
  const { user, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/[0.06]">
        <div className="max-w-screen-xl mx-auto px-4 h-[68px] flex items-center gap-2">

          {/* Logo */}
          <button onClick={() => navigate('home')}
                  className="flex items-center gap-2 mr-4 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center text-sm font-black">N</div>
            <span className="font-bold text-sm tracking-wide hidden sm:block">OEI Nexus</span>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                        ${activePage === item.id
                          ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                          : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((o) => !o)}
                        className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg
                                   border border-white/10 hover:border-brand-teal/30 transition-all text-xs">
                  <span className="w-5 h-5 rounded-full btn-gradient flex items-center
                                   justify-center text-[10px] font-bold flex-shrink-0">
                    {(user.full_name ?? user.email)[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-white/80 max-w-[100px] truncate">
                    {user.full_name ?? user.email}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 glass rounded-xl
                                  border border-white/10 shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs text-white/80 font-medium truncate">{user.email}</p>
                      <p className="text-[10px] text-white/40 capitalize">{user.role}</p>
                    </div>
                    <button onClick={() => { logout(); setMenuOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs text-red-400
                                       hover:bg-red-500/10 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowModal(true)}
                      className="btn-gradient px-4 py-1.5 rounded-lg text-xs font-semibold
                                 hover:opacity-90 transition-opacity whitespace-nowrap">
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  )
}
