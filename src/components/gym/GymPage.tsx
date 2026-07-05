// src/components/gym/GymPage.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Trophy, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useGymStore } from '../../store/gymStore'
import { useGymFirestore } from '../../hooks/useGymFirestore'
import GymAddForm from './GymAddForm'
import GymHeatmap from './GymHeatmap'
import GymSessionCard from './GymSessionCard'
import type { GymSession } from '../../types/gym'

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function computeStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0
  const sorted = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a))
  const today = toISO(new Date())
  const yesterday = toISO(new Date(Date.now() - 86400000))

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 0
  let cursor = new Date(sorted[0] + 'T00:00:00')

  for (const iso of sorted) {
    const expected = toISO(cursor)
    if (iso === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function GymPage() {
  // Wire Firestore sync (no-ops when unconfigured)
  useGymFirestore()

  const sessions = useGymStore((s) => s.sessions)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editSession, setEditSession] = useState<GymSession | null>(null)
  const [selectedDate, setSelectedDate] = useState(toISO(now))

  // Stats
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthSessions = useMemo(
    () => sessions.filter((s) => s.date.startsWith(monthKey)),
    [sessions, monthKey]
  )
  const completedThisMonth = monthSessions.filter((s) => s.isCompleted)
  const consistencyPct = monthSessions.length > 0
    ? Math.round((completedThisMonth.length / monthSessions.length) * 100)
    : 0

  const allCompletedDates = sessions.filter((s) => s.isCompleted).map((s) => s.date)
  const currentStreak = useMemo(() => computeStreak(allCompletedDates), [allCompletedDates])

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20),
    [sessions]
  )

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Hero stats card */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 rounded-3xl p-5 shadow-xl shadow-orange-500/25 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/10 blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-3">Gym Tracker</p>

          {/* 3-stat row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Streak */}
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Flame size={14} className="text-amber-300" />
                <span className="text-2xl font-extrabold text-white leading-none">{currentStreak}</span>
              </div>
              <p className="text-orange-100/80 text-[10px] font-medium">Day Streak</p>
            </div>

            {/* This month sessions */}
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <span className="text-2xl font-extrabold text-white leading-none block mb-0.5">
                {completedThisMonth.length}
              </span>
              <p className="text-orange-100/80 text-[10px] font-medium">Sessions</p>
            </div>

            {/* Consistency */}
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <span className="text-2xl font-extrabold text-white leading-none block mb-0.5">
                {consistencyPct}%
              </span>
              <p className="text-orange-100/80 text-[10px] font-medium">Consistency</p>
            </div>
          </div>

          {/* Monthly progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-orange-100/70 text-xs">Monthly goal (20 sessions)</span>
              <span className="text-white text-xs font-bold">{completedThisMonth.length}/20</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (completedThisMonth.length / 20) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* Achievement badge */}
          {currentStreak >= 7 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 w-fit"
            >
              <Trophy size={14} className="text-amber-300" />
              <span className="text-white text-xs font-bold">🔥 {currentStreak}-day streak! Keep going!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <GymAddForm
            defaultDate={selectedDate}
            existingSession={editSession || undefined}
            onClose={() => {
              setShowForm(false)
              setEditSession(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Add button */}
      <div className="flex justify-end">
        <motion.button
          id="btn-add-gym-session"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setSelectedDate(toISO(new Date()))
            setEditSession(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
        >
          <Plus size={15} />
          Log Session
        </motion.button>
      </div>

      {/* Heatmap section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4 relative z-20">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
            Daily Heatmap
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-0.5">
            <button
              id="heatmap-prev-month"
              onClick={() => shiftMonth(-1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)} 
              className="text-[11px] uppercase tracking-wider font-bold px-2 py-1 min-w-[90px] text-center rounded-lg transition-colors text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {monthLabel}
            </button>
            <button
              id="heatmap-next-month"
              onClick={() => shiftMonth(1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          
          <AnimatePresence>
            {showMonthPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)] border border-slate-200/60 dark:border-slate-700/60 w-[220px] z-50"
                >
                  <div className="flex justify-between items-center mb-3 px-1">
                    <button onClick={() => shiftMonth(-12)} className="p-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronLeft size={14}/></button>
                    <span className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 tracking-wide">
                      {viewYear}
                    </span>
                    <button onClick={() => shiftMonth(12)} className="p-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronRight size={14}/></button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <button
                        key={m}
                        onClick={() => {
                          setViewYear(viewYear);
                          setViewMonth(i);
                          setShowMonthPicker(false);
                        }}
                        className={'py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ' + (
                          viewMonth === i
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <GymHeatmap 
          year={viewYear} 
          month={viewMonth} 
          onDayClick={(iso, session) => {
            setSelectedDate(iso)
            setEditSession(session)
            setShowForm(true)
          }}
        />
      </div>

      {/* Recent sessions list */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Recent Sessions
        </h3>
        <AnimatePresence mode="popLayout">
          {recentSessions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-14 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Inbox size={28} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No sessions logged</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Tap "Log Session" to record your first workout.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session, i) => (
                <GymSessionCard key={session.id} session={session} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
