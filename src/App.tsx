// src/App.tsx
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store/appStore'
import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import BusinessHubHome from './components/dashboard/BusinessHubHome'
import IncomePage from './components/income/IncomePage'
import SchedulePage from './components/schedule/SchedulePage'
import GymPage from './components/gym/GymPage'
import AnalyticsPage from './components/analytics/AnalyticsPage'
import SavingsPage from './components/savings/SavingsPage'
import ProfilePage from './components/profile/ProfilePage'
import FirebaseSyncManager from './components/FirebaseSyncManager'

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit:    { opacity: 0, y: -15, transition: { duration: 0.15 } },
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  income:    'Income Tracker',
  analytics: 'Analytics',
  schedule:  'Daily Schedule',
  gym:       'Gym Tracker',
  savings:   'Savings Vault',
  profile:   'My Profile',
}

// ── Inline desktop top-bar components ────────────────────────────────────────

function DesktopPageTitle() {
  const activePage = useAppStore((s) => s.activePage)
  const theme = useAppStore((s) => s.theme)
  return (
    <h1
      className="text-sm font-extrabold tracking-wide"
      style={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
    >
      {PAGE_TITLES[activePage] ?? 'Farid Tracker'}
    </h1>
  )
}

function DesktopTopBarRight() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-2">
      {/* Bell */}
      <button
        id="desktop-btn-notifications"
        className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-colors"
        style={{ color: isDark ? '#64748b' : '#94a3b8' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
      </button>

      {/* Theme toggle */}
      <motion.button
        id="desktop-btn-theme"
        whileTap={{ rotate: 20 }}
        onClick={toggleTheme}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            {isDark
              ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )
              : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )
            }
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

// ── Page switcher ─────────────────────────────────────────────────────────────

function PageContent() {
  const activePage = useAppStore((s) => s.activePage)
  return (
    <AnimatePresence mode="wait">
      <motion.div key={activePage} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        {activePage === 'dashboard' && <BusinessHubHome />}
        {activePage === 'income'    && <IncomePage />}
        {activePage === 'schedule'  && <SchedulePage />}
        {activePage === 'gym'       && <GymPage />}
        {activePage === 'analytics' && <AnalyticsPage />}
        {activePage === 'savings'   && <SavingsPage />}
        {activePage === 'profile'   && <ProfilePage />}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { splashDone, user, theme } = useAppStore()

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#020617' : '#f8fafc'
    document.body.style.color = theme === 'dark' ? '#f8fafc' : '#0f172a'
  }, [theme])

  return (
    <>
      <SplashScreen />

      {splashDone && (
        <>
          {!user ? (
            <LoginScreen />
          ) : (
            <div
              className="min-h-dvh transition-colors duration-300 flex"
              style={{ background: theme === 'dark' ? '#020617' : '#f8fafc' }}
            >
              <Toaster position="top-center" toastOptions={{ style: { background: theme === 'dark' ? '#1E293B' : '#fff', color: theme === 'dark' ? '#fff' : '#000' } }} />
              <FirebaseSyncManager />
              {/* ── Desktop Sidebar — hidden on mobile ── */}
              <Sidebar />

              {/* ── Right column (header / content / bottom-nav) ── */}
              <div className="flex-1 flex flex-col min-h-dvh md:pl-[250px]">

                {/* Mobile-only top header */}
                <div className="md:hidden">
                  <Header />
                </div>

                {/* Desktop-only slim top bar */}
                <div
                  className="hidden md:flex items-center justify-between px-8 h-14 sticky top-0 z-30 transition-colors duration-300 flex-shrink-0"
                  style={{
                    background: theme === 'dark' ? 'rgba(2,6,23,0.92)' : 'rgba(248,250,252,0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: theme === 'dark' ? '1px solid #1E293B' : '1px solid #e2e8f0',
                  }}
                >
                  <DesktopPageTitle />
                  <DesktopTopBarRight />
                </div>

                {/* Scrollable main content */}
                <main className="flex-1 px-4 py-5 pb-28 md:px-8 md:py-7 md:pb-10">
                  {/* Max-width container: narrow on mobile, wider on desktop */}
                  <div className="w-full max-w-[520px] mx-auto md:max-w-7xl">
                    <PageContent />
                  </div>
                </main>

                {/* Mobile-only bottom navigation */}
                <div className="md:hidden">
                  <BottomNav />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
