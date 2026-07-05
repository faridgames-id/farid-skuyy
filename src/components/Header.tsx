import { Moon, Sun, Database, ChevronDown, LogOut, UserCircle, Menu, X, LayoutDashboard, BarChart2, CalendarDays, Dumbbell, DollarSign, PiggyBank, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useAppStore, clearAllLocalData } from '../store/appStore'
import { restoreBackupToCloud } from '../lib/cloudSync'

function Avatar({ name, photoURL }: { name: string; photoURL: string | null }) {
  if (photoURL) {
    return (
      <img src={photoURL} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40" />
    )
  }
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-blue-500/30">
      {initials}
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'income',    label: 'Income',     icon: DollarSign },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
  { id: 'schedule',  label: 'Tasks',      icon: CalendarDays },
  { id: 'gym',       label: 'Gym',        icon: Dumbbell },
  { id: 'savings',   label: 'Vault',      icon: PiggyBank },
] as const

export default function Header() {
  const { user, theme, toggleTheme, setUser, activePage, setActivePage } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)

  const displayName = user?.displayName ?? 'User'

  const handleExportData = () => {
    const data = JSON.stringify(localStorage)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farid-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowDataModal(false)
  }

  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (typeof data === 'object' && data !== null) {
          clearAllLocalData() // only clear the feature stores, not the user session
          Object.keys(data).forEach(key => {
            if (key.startsWith('farid-') && key !== 'farid-tracker-store') {
              const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key])
              localStorage.setItem(key, value)
            }
          })
          
          const user = useAppStore.getState().user
          if (user && !user.uid.startsWith('guest-')) {
            toast.loading('Sinkronisasi ke Cloud...', { id: 'cloud-sync' })
            restoreBackupToCloud(user.uid, data).then(() => {
              toast.success('Data berhasil diimpor! Halaman akan dimuat ulang.', { id: 'cloud-sync', icon: '📦' })
              setTimeout(() => window.location.reload(), 1500)
            }).catch(() => {
              toast.error('Gagal sinkronisasi ke Cloud.', { id: 'cloud-sync' })
              setTimeout(() => window.location.reload(), 1500)
            })
          } else {
            toast.success('Data berhasil diimpor! Halaman akan dimuat ulang.', { icon: '📦' })
            setTimeout(() => window.location.reload(), 1500)
          }
        } else {
          toast.error('File backup tidak valid.')
        }
      } catch (err) {
        toast.error('Gagal membaca file backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-colors duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: theme === 'dark' ? '1px solid #1E293B' : '1px solid rgba(226,232,240,0.6)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand & Mobile Menu */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-8 h-8 -ml-2 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          >
            <Menu size={20} />
          </button>
          
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow shadow-blue-500/40">
            <svg width="15" height="15" viewBox="0 0 56 56" fill="none">
              <path d="M18 36 L22 26 L28 32 L34 20 L38 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="38" cy="28" r="3" fill="white"/>
            </svg>
          </div>
          <span
            className="font-extrabold text-sm leading-none"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          >
            Farid{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
              Tracker
            </span>
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Database Export/Import */}
          <button
            id="btn-notifications"
            onClick={() => setShowDataModal(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-colors"
            style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}
          >
            <Database size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          {/* Theme toggle */}
          <motion.button
            id="btn-theme-toggle"
            whileTap={{ rotate: 20 }}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}
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
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              id="btn-user-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-xl transition-colors hover:bg-white/5"
            >
              {/* Active dot */}
              <div className="relative">
                <Avatar name={displayName} photoURL={user?.photoURL ?? null} />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                  style={{ borderColor: theme === 'dark' ? '#020617' : 'white' }} />
              </div>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                style={{ color: theme === 'dark' ? '#475569' : '#94a3b8' }}
              />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93, y: -6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: theme === 'dark' ? '#1E293B' : 'white',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="px-4 py-3"
                    style={{ borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                    <p className="text-sm font-bold truncate" style={{ color: theme === 'dark' ? 'white' : '#0f172a' }}>
                      {displayName}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}>
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-emerald-500 font-semibold">Active</span>
                    </div>
                  </div>

                  <button
                    id="btn-view-profile"
                    onClick={() => { setActivePage('profile'); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
                  >
                    <UserCircle size={14} /> My Profile
                  </button>

                  <button
                    id="btn-logout"
                    onClick={() => { setMenuOpen(false); setShowSignoutConfirm(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSignoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-3xl p-5 relative z-10 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 text-center"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 rotate-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Sign Out?</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Are you sure you want to log out of your account? You will need to login again to access your data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setUser(null); setShowSignoutConfirm(false) }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Data Export/Import Modal Placeholder */}
      <AnimatePresence>
        {showDataModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDataModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-3xl p-5 relative z-10 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 text-center"
            >
              <button
                onClick={() => setShowDataModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Data Management</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Export your tracker data to a file or import existing data.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                >
                  Export Data
                </button>
                <label className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer block">
                  <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                  Import Data
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] z-[70] flex flex-col md:hidden shadow-2xl"
              style={{
                background: theme === 'dark' ? '#0B1120' : '#ffffff',
                borderRight: theme === 'dark' ? '1px solid #1E293B' : '1px solid #e2e8f0',
              }}
            >
              <div className="px-5 pt-6 pb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 56 56" fill="none">
                      <path d="M18 36 L22 26 L28 32 L34 20 L38 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <circle cx="38" cy="28" r="3" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-extrabold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Farid <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">Tracker</span>
                    </p>
                    <p className={`text-[10px] font-medium mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Personal Command Center
                    </p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              {/* ── Divider ── */}
              <div className={`mx-5 h-px mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />

              {/* ── Section label ── */}
              <p className={`px-5 text-[10px] font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                Main Menu
              </p>

              {/* ── Nav links ── */}
              <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = activePage === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setDrawerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                          : theme === 'dark'
                          ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                      )}

                      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} className="flex-shrink-0" />
                      {item.label}

                      {/* Active dot */}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </button>
                  )
                })}

                {/* ── Divider above profile ── */}
                <div className={`my-2 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />

                <button
                  onClick={() => { setActivePage('profile'); setDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    activePage === 'profile'
                      ? theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {activePage === 'profile' && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                  )}
                  <UserCircle size={17} strokeWidth={activePage === 'profile' ? 2.2 : 1.7} />
                  Profile
                  {activePage === 'profile' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
              </nav>

              {/* ── Bottom user card ── */}
              <div
                className="mx-3 mb-4 mt-2 rounded-2xl p-3"
                style={{
                  background: theme === 'dark' ? '#1E293B' : '#f8fafc',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                }}
              >
                {/* User row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="relative flex-shrink-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={displayName} className="w-9 h-9 rounded-xl object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold">
                        {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-50 dark:border-[#1E293B]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {displayName}
                    </p>
                    <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {user?.email ?? ''}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1.5">
                  <button
                    onClick={toggleTheme}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                      theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>

                  <button
                    onClick={() => { setUser(null); setDrawerOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors text-red-400 ${
                      theme === 'dark' ? 'bg-red-950/30 hover:bg-red-950/50' : 'bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
