import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Home          from './pages/Home'
import ScoreDashboard from './pages/ScoreDashboard'
import Explorer      from './pages/Explorer'
import ImpactDashboard from './pages/ImpactDashboard'
import FinanceHub    from './pages/FinanceHub'
import AiAdvisor     from './pages/AiAdvisor'
import Academy       from './pages/Academy'
import OpenLab       from './pages/OpenLab'

const PAGES = {
  home:     Home,
  score:    ScoreDashboard,
  explorer: Explorer,
  impact:   ImpactDashboard,
  finance:  FinanceHub,
  ai:       AiAdvisor,
  academy:  Academy,
  lab:      OpenLab,
}

export default function App() {
  const [activePage, setActivePage] = useState('home')

  const navigate = (id) => {
    setActivePage(id)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Subtle parallax for hero visual
  useEffect(() => {
    const handler = (e) => {
      const el = document.querySelector('.hero-visual')
      if (!el || activePage !== 'home') return
      const x = (e.clientX / window.innerWidth - 0.5) * 10
      const y = (e.clientY / window.innerHeight - 0.5) * 10
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [activePage])

  const Page = PAGES[activePage] || Home

  return (
    <AuthProvider>
    <div className="min-h-screen bg-navy-950 text-white font-sans">
      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* Navbar */}
      <Navbar activePage={activePage} navigate={navigate} />

      {/* Page Content */}
      <main className={`relative z-10 ${activePage === 'explorer' ? '' : 'pt-[68px]'}`}>
        <Page navigate={navigate} />
      </main>
    </div>
    </AuthProvider>
  )
}
