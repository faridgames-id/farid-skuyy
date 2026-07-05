// src/components/analytics/SmartAnalyticsCalendar.tsx
// Gamified heatmap calendar with per-day income/savings/tasks modal.
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, CalendarDays, DollarSign, Bitcoin, PiggyBank } from 'lucide-react'
import { useIncomeStore } from '../../store/incomeStore'
import { useScheduleStore } from '../../store/scheduleStore'
import { useGymStore } from '../../store/gymStore'
import { useSavingsStore } from '../../store/savingsStore'
import { useAppStore } from '../../store/appStore'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatRp(n: number) {
  if (n === 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n).replace('IDR', 'Rp')
}

function formatRpShort(n: number) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(n)}`
}

// ── Day cell color logic ──────────────────────────────────────────────────────
// Returns a CSS classes string based on task + gym completion for that day.

type DayStatus = 'full' | 'partial' | 'gym' | 'income' | 'none' | 'future'

function getDayStatus(
  iso: string,
  scheduleTasks: ReturnType<typeof useScheduleStore.getState>['tasks'],
  gymSessions: ReturnType<typeof useGymStore.getState>['sessions'],
  todayISO: string
): DayStatus {
  if (iso > todayISO) return 'future'

  const dayTasks = scheduleTasks.filter((t) => t.date === iso)
  const dayGym = gymSessions.find((s) => s.date === iso && s.isCompleted)

  if (dayTasks.length > 0) {
    const allDone = dayTasks.every((t) => t.isCompleted)
    if (allDone) return 'full'
    const someDone = dayTasks.some((t) => t.isCompleted)
    return someDone ? 'partial' : 'none'
  }

  if (dayGym) return 'gym'
  return 'none'
}

// ── Cell style map ─────────────────────────────────────────────────────────────

interface CellStyle {
  bg: string
  text: string
  ring?: string
  label: string
}

function getCellStyle(status: DayStatus, isDark: boolean, hasIncome: boolean): CellStyle {
  switch (status) {
    case 'full':
      return {
        bg: isDark ? 'bg-green-500/90' : 'bg-green-500',
        text: 'text-white',
        ring: 'ring-2 ring-green-400/40',
        label: '✓',
      }
    case 'partial':
      return {
        bg: isDark ? 'bg-green-900/50' : 'bg-green-100',
        text: isDark ? 'text-green-300' : 'text-green-700',
        label: '~',
      }
    case 'gym':
      return {
        bg: isDark ? 'bg-orange-900/50' : 'bg-orange-100',
        text: isDark ? 'text-orange-300' : 'text-orange-700',
        label: '💪',
      }
    case 'none':
      return {
        bg: hasIncome
          ? isDark ? 'bg-blue-900/40' : 'bg-blue-50'
          : isDark ? 'bg-slate-800' : 'bg-slate-100',
        text: hasIncome
          ? isDark ? 'text-blue-300' : 'text-blue-600'
          : isDark ? 'text-slate-500' : 'text-slate-400',
        label: hasIncome ? '$' : '',
      }
    case 'future':
      return {
        bg: isDark ? 'bg-slate-800/40' : 'bg-slate-50',
        text: isDark ? 'text-slate-700' : 'text-slate-300',
        label: '',
      }
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface DayModalProps {
  iso: string
  onClose: () => void
}

function DayModal({ iso, onClose }: DayModalProps) {
  const incomeEntries = useIncomeStore((s) => s.entries)
  const scheduleTasks = useScheduleStore((s) => s.tasks)
  const gymSessions = useGymStore((s) => s.sessions)
  const savingsEntries = useSavingsStore((s) => s.entries)
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'

  const dayIncome = useMemo(
    () => incomeEntries.filter((e) => e.date === iso),
    [incomeEntries, iso]
  )
  const totalIncome = dayIncome.reduce((s, e) => s + e.amount, 0)
  const totalExpense = 0

  const daySavings = useMemo(
    () => savingsEntries.filter((e) => e.date === iso),
    [savingsEntries, iso]
  )
  const btcSavings = daySavings.filter((e) => e.assetType === 'bitcoin').reduce((s, e) => s + e.amount, 0)
  const sbSavings = daySavings.filter((e) => e.assetType === 'seabank').reduce((s, e) => s + e.amount, 0)

  const dayTasks = scheduleTasks.filter((t) => t.date === iso)
  const doneTasks = dayTasks.filter((t) => t.isCompleted)
  const completionPct = dayTasks.length > 0
    ? Math.round((doneTasks.length / dayTasks.length) * 100)
    : null

  const dayGym = gymSessions.filter((s) => s.date === iso && s.isCompleted)

  const dateLabel = new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`relative w-full max-w-sm rounded-3xl overflow-hidden z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]`}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: isDark ? '1px solid #1E293B' : '1px solid #f1f5f9' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CalendarDays size={14} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Daily Summary
              </p>
            </div>
            <h2 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {dateLabel}
            </h2>
          </div>
          <button
            id="modal-close"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Combined Summary Table */}
        <div className="px-5 pt-6 pb-6 flex flex-col items-center">
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Income */}
            <div className="rounded-2xl px-3 py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 border-none text-center flex flex-col justify-center shadow-md shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-emerald-50 mb-1.5 uppercase tracking-wider">Pemasukan</p>
                <p className="text-xl font-extrabold text-white leading-none">{formatRpShort(totalIncome)}</p>
                <p className="text-[9px] font-medium text-emerald-100 mt-2">{totalIncome === 0 ? 'Tidak ada catatan' : '+ Income'}</p>
              </div>
            </div>

            {/* Expense */}
            <div className="rounded-2xl px-3 py-3 bg-gradient-to-br from-rose-400 to-rose-600 border-none text-center flex flex-col justify-center shadow-md shadow-rose-500/20 relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-rose-50 mb-1.5 uppercase tracking-wider">Pengeluaran</p>
                <p className="text-xl font-extrabold text-white leading-none">{formatRpShort(totalExpense)}</p>
                <p className="text-[9px] font-medium text-rose-100 mt-2">{totalExpense === 0 ? 'Belum ada data' : '- Expense'}</p>
              </div>
            </div>

            {/* Tasks */}
            <div className={`rounded-2xl px-3 py-3 border-none text-center flex flex-col justify-center shadow-md relative overflow-hidden group ${completionPct === 100 ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/20' : 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/20'}`}>
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/80 mb-1.5 uppercase tracking-wider">Tasks Done</p>
                <p className="text-xl font-extrabold text-white leading-none">{completionPct !== null ? `${completionPct}%` : '–'}</p>
                <p className="text-[9px] font-medium text-white/70 mt-2">{dayTasks.length > 0 ? `${doneTasks.length}/${dayTasks.length} tasks` : 'No tasks'}</p>
              </div>
            </div>

            {/* Gym */}
            <div className={`rounded-2xl px-3 py-3 border-none text-center flex flex-col justify-center shadow-md relative overflow-hidden group ${dayGym.length > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/20' : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/20'}`}>
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/80 mb-1.5 uppercase tracking-wider">Gym Session</p>
                <p className="text-xl font-extrabold text-white leading-none">{dayGym.length > 0 ? dayGym[0].type : '–'}</p>
                <p className="text-[9px] font-medium text-white/70 mt-2">{dayGym.length > 0 && dayGym[0].durationMin ? `${dayGym[0].durationMin} min` : 'No session'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        {(totalIncome > 0 || totalExpense > 0 || dayIncome.length > 0) && (
          <div className="px-5 pb-6">
            {totalIncome > 0 && (
              <div className={`rounded-2xl px-4 py-3 flex items-center justify-between mb-4 ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'
              }`}>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Net Saldo</span>
                <span className={`text-sm font-extrabold ${totalIncome - totalExpense >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {totalIncome - totalExpense >= 0 ? '+' : ''}{formatRpShort(totalIncome - totalExpense)}
                </span>
              </div>
            )}

            {dayIncome.length > 0 && (
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Rincian Pemasukan
                </p>
                <div className="space-y-2">
                  {dayIncome.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl ${
                        isDark ? 'bg-slate-800/60' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <DollarSign size={13} className="text-emerald-500 flex-shrink-0" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {entry.source}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-500">
                        {formatRpShort(entry.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Main Calendar Component ───────────────────────────────────────────────────

export default function SmartAnalyticsCalendar({
  viewYear,
  viewMonth,
  setViewYear,
  setViewMonth
}: {
  viewYear: number
  viewMonth: number
  setViewYear: (y: number) => void
  setViewMonth: (m: number) => void
}) {
  const incomeEntries = useIncomeStore((s) => s.entries)
  const scheduleTasks = useScheduleStore((s) => s.tasks)
  const gymSessions = useGymStore((s) => s.sessions)
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'

  const now = new Date()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const todayISO = toISO(now)

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric',
  })

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  // Build calendar grid
  const { days, firstWeekday } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const firstWeekday = firstDay.getDay() // 0=Sun

    const days = Array.from({ length: lastDay.getDate() }, (_, i) => {
      const date = new Date(viewYear, viewMonth, i + 1)
      const iso = toISO(date)
      const status = getDayStatus(iso, scheduleTasks, gymSessions, todayISO)
      const dayIncome = incomeEntries
        .filter((e) => e.date === iso)
        .reduce((s, e) => s + e.amount, 0)
      const isToday = iso === todayISO

      return { iso, day: i + 1, status, hasIncome: dayIncome > 0, incomeTotal: dayIncome, isToday }
    })

    return { days, firstWeekday }
  }, [viewYear, viewMonth, scheduleTasks, gymSessions, incomeEntries, todayISO])

  // Month stats
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthStats = useMemo(() => {
    const monthTasks = scheduleTasks.filter((t) => t.date.startsWith(monthKey))
    const monthDone = monthTasks.filter((t) => t.isCompleted)
    const completedGym = gymSessions.filter((s) => s.date.startsWith(monthKey) && s.isCompleted)
    const totalIncome = incomeEntries
      .filter((e) => e.date.startsWith(monthKey) && e.type !== 'expense')
      .reduce((s, e) => s + e.amount, 0)
    const totalExpense = incomeEntries
      .filter((e) => e.date.startsWith(monthKey) && e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0)
    const fullDays = days.filter((d) => d.status === 'full').length
    return { totalTasks: monthTasks.length, doneTasks: monthDone.length, gymDays: completedGym.length, totalIncome, totalExpense, fullDays }
  }, [scheduleTasks, gymSessions, incomeEntries, monthKey, days])

  const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? '#1E293B' : '#ffffff',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-4 pt-4 pb-4"
          style={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Smart Calendar
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Tap any day for income & activity details
              </p>
            </div>
            {/* Month navigator */}
            <div className={`flex items-center gap-1 rounded-xl p-0.5 relative z-50 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <button
                id="cal-prev-month"
                onClick={() => shiftMonth(-1)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={15} />
              </button>
              
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)} 
                className={`text-[11px] uppercase tracking-wider font-bold px-2 py-1 min-w-[90px] text-center rounded-lg transition-colors ${
                  isDark ? 'text-white hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {monthLabel}
              </button>

              <button
                id="cal-next-month"
                onClick={() => shiftMonth(1)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <ChevronRight size={15} />
              </button>
              
              <AnimatePresence>
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2.5 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)] border border-slate-200/60 dark:border-slate-700/60 w-[220px] z-50"
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
          </div>

          {/* Month summary pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Full Days', value: monthStats.fullDays, color: 'text-white', labelColor: 'text-blue-100', bg: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm shadow-blue-500/20' },
              { label: 'Gym Days', value: monthStats.gymDays, color: 'text-white', labelColor: 'text-orange-100', bg: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-500/20' },
              { label: 'Income', value: formatRpShort(monthStats.totalIncome).replace('Rp ', ''), color: 'text-white', labelColor: 'text-emerald-100', bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/20' },
              { label: 'Expense', value: formatRpShort(monthStats.totalExpense).replace('Rp ', ''), color: 'text-white', labelColor: 'text-rose-100', bg: 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm shadow-rose-500/20' },
            ].map((pill) => (
              <div key={pill.label} className={`rounded-xl px-3 py-3 text-center border-none relative overflow-hidden group ${pill.bg}`}>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10">
                  <p className={`text-base font-extrabold ${pill.color}`}>{pill.value}</p>
                  <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${pill.labelColor}`}>{pill.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Calendar Grid ── */}
        <div className="px-3 pt-3 pb-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className={`text-center text-[9px] font-bold uppercase py-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {l}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((d, idx) => {
              const style = getCellStyle(d.status, isDark, d.hasIncome)
              const isClickable = d.status !== 'future'

              return (
                <motion.button
                  key={d.iso}
                  id={`cal-day-${d.iso}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.006, duration: 0.2 }}
                  whileHover={isClickable ? { scale: 1.12, zIndex: 10 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => isClickable && setSelectedDay(d.iso)}
                  disabled={!isClickable}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                    transition-all duration-150
                    ${style.bg} ${style.text} ${style.ring ?? ''}
                    ${d.isToday ? 'ring-2 ring-blue-500 ring-offset-1 ' + (isDark ? 'ring-offset-[#1E293B]' : 'ring-offset-white') : ''}
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <span className="text-[10px] font-bold leading-none">{d.day}</span>

                  {/* Status indicator dot */}
                  {style.label && style.label !== '' && style.label !== '💪' && style.label !== '$' && (
                    <span className="text-[7px] leading-none mt-0.5 opacity-80">{style.label}</span>
                  )}
                  {(style.label === '💪' || style.label === '$') && (
                    <span className="text-[8px] leading-none mt-0.5">{style.label}</span>
                  )}

                  {/* Income dot indicator */}
                  {d.hasIncome && d.status !== 'future' && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border ${
                      isDark ? 'bg-emerald-400 border-[#1E293B]' : 'bg-emerald-500 border-white'
                    }`} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Legend ── */}
        <div
          className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1"
          style={{ borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}
        >
          {[
            { color: isDark ? 'bg-green-500/90' : 'bg-green-500', label: '100% Done' },
            { color: isDark ? 'bg-green-900/50' : 'bg-green-100', label: 'Partial' },
            { color: isDark ? 'bg-orange-900/50' : 'bg-orange-100', label: 'Gym Only' },
            { color: 'bg-emerald-400', label: 'Has Income', dot: true },
            { color: isDark ? 'bg-slate-800' : 'bg-slate-100', label: 'No Activity' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${item.color} flex-shrink-0`} />
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-blue-500 flex-shrink-0" />
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Today
            </span>
          </div>
        </div>
      </div>

      {/* ── Day Detail Modal ── */}
      <AnimatePresence>
        {selectedDay && (
          <DayModal
            key={selectedDay}
            iso={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
