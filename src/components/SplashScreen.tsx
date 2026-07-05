import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'

const LOGO_ICON = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <rect width="56" height="56" rx="16" fill="url(#lg1)" opacity="0.15" />
    <rect x="6" y="6" width="44" height="44" rx="12" fill="url(#lg1)" opacity="0.25" />
    <path d="M18 36 L22 26 L28 32 L34 20 L38 28" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="38" cy="28" r="3" fill="#818cf8"/>
    <circle cx="18" cy="36" r="2" fill="#60a5fa"/>
  </svg>
)

export default function SplashScreen() {
  const setSplashDone = useAppStore((s) => s.setSplashDone)
  const [phase, setPhase] = useState<'logo' | 'text' | 'out'>('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => setSplashDone(true), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [setSplashDone])

  return (
    <AnimatePresence>
      {phase !== 'out' ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center splash-bg overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Ambient orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/20 blur-[80px] orb-animate pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-600/20 blur-[80px] orb-animate-delay pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-900/30 blur-[120px] pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center">
              {LOGO_ICON}
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl scale-110 -z-10" />
          </motion.div>

          {/* Title */}
          <AnimatePresence>
            {phase === 'text' && (
              <motion.div
                key="title"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center"
              >
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Farid{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    Tracker
                  </span>
                </h1>
                <p className="mt-2 text-slate-400 text-sm font-medium tracking-wide">
                  Income · Schedule · Gym
                </p>

                {/* Loading bar */}
                <div className="mt-6 w-40 mx-auto">
                  <div className="h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.0, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
