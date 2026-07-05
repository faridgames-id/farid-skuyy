// src/components/Sidebar.tsx
// Desktop-only persistent sidebar (hidden below md breakpoint).
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, BarChart2, CalendarDays, Dumbbell,
  UserCircle, Moon, Sun, LogOut, DollarSign, Bell, PiggyBank, AlertTriangle
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

type NavId = 'dashboard' | 'income' | 'analytics' | 'schedule' | 'gym' | 'savings' | 'profile'

const NAV_ITEMS: { id: NavId; label: string; icon: React.ElementType; emoji?: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'income',    label: 'Income',     icon: DollarSign },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
  { id: 'schedule',  label: 'Tasks',      icon: CalendarDays },
  { id: 'gym',       label: 'Gym',        icon: Dumbbell },
  { id: 'savings',   label: 'Vault',      icon: PiggyBank },
]

const TRACKER_SVG = (
  <svg width="16" height="16" viewBox="0 0 56 56" fill="none">
    <path d="M18 36 L22 26 L28 32 L34 20 L38 28"
      stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="38" cy="28" r="3" fill="white"/>
  </svg>
)

export default function Sidebar() {
  const { user, theme, activePage, setActivePage, toggleTheme, setUser } = useAppStore()
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const displayName = user?.displayName ?? 'User'
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const isDark = theme === 'dark'

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[250px] z-40 select-none"
      style={{
        background: isDark ? '#0B1120' : '#ffffff',
        borderRight: isDark ? '1px solid #1E293B' : '1px solid #e2e8f0',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          {TRACKER_SVG}
        </div>
        <div>
          <p className={`text-sm font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Farid{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
              Tracker
            </span>
          </p>
          <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Personal Command Center
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={`mx-5 h-px mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

      {/* ── Section label ── */}
      <p className={`px-5 text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Main Menu
      </p>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <AnimatePresence>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActivePage(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className="flex-shrink-0"
                />
                {item.label}

                {/* Active dot */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* ── Divider above profile ── */}
        <div className={`my-2 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

        <motion.button
          id="sidebar-nav-profile"
          onClick={() => setActivePage('profile')}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
            activePage === 'profile'
              ? isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
              : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          {activePage === 'profile' && (
            <motion.div
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <UserCircle size={17} strokeWidth={activePage === 'profile' ? 2.2 : 1.7} />
          Profile
          {activePage === 'profile' && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </motion.button>
      </nav>

      {/* User Profile Section */}
      <div
        className={`mx-3 mb-4 mt-2 rounded-[24px] p-3.5 relative overflow-hidden transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-[0_2px_15px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Subtle decorative background bubbles */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-14 h-14 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        {/* User row */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="relative flex-shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="w-10 h-10 rounded-[14px] object-cover ring-2 ring-blue-500/20" />
            ) : (
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm shadow-blue-500/20">
                {initials}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-[2.5px] ${isDark ? 'border-slate-900' : 'border-white'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] font-extrabold truncate tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {displayName}
            </p>
            <p className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {user?.email ?? 'No email'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 relative z-10">
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-sm hover:shadow-md ${
              isDark 
                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50' 
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
              </motion.span>
            </AnimatePresence>
            {isDark ? 'Light' : 'Dark'}
          </motion.button>

          {/* Sign out */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSignoutConfirm(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-sm hover:shadow-md ${
              isDark 
                ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 hover:from-red-500/20 hover:to-rose-500/20 border border-red-500/20' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-500 hover:from-red-100 hover:to-rose-100 border border-red-100'
            }`}
          >
            <LogOut size={12} />
            Sign out
          </motion.button>
        </div>
      </div>

      {/* Signout Confirm Modal for Sidebar */}
      <AnimatePresence>
        {showSignoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSignoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[24px] p-6 relative z-10 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 -z-10" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-400/20 dark:bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-500/20 dark:to-rose-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-200/50 dark:border-red-500/20">
                <AlertTriangle size={28} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">Sign Out?</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSignoutConfirm(false)
                    setUser(null)
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  )
}
