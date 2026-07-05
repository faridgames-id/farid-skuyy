import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CalendarPicker from '../schedule/CalendarPicker'
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, CalendarCheck, Flame, BookOpen, Dumbbell, CheckSquare, Pencil, Trophy, Star, PiggyBank } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useIncomeStore } from '../../store/incomeStore'
import { useScheduleStore } from '../../store/scheduleStore'
import { useGymStore } from '../../store/gymStore'
import { useSavingsStore } from '../../store/savingsStore'
import { getLocalISOString, getLocalISOMonth } from '../../utils/date'

function formatRpShort(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function toISO(d: Date) { return getLocalISOString(d) }
function computeStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a))
  const today = toISO(new Date()); const yesterday = toISO(new Date(Date.now() - 86400000))
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 0; let cursor = new Date(sorted[0] + 'T00:00:00')
  for (const iso of sorted) {
    if (iso === toISO(cursor)) { streak++; cursor.setDate(cursor.getDate() - 1) } else break
  }
  return streak
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}

// ── Metric Square (2x2 Grid Item) ──
function MetricSquare({ icon, title, value, subtitle, gradientClass, textClass, subtitleClass }: any) {
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
      className={`group relative overflow-hidden rounded-[1.25rem] p-4 flex flex-col border border-white/20 dark:border-white/10 shadow-[0_8px_20px_rgb(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] cursor-pointer ${gradientClass}`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:bg-white/30" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none border border-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-125" />
      <div className="absolute top-1/4 right-8 w-4 h-4 bg-white/20 rounded-full pointer-events-none blur-[1px] transition-transform duration-500 group-hover:-translate-y-2 group-hover:translate-x-2" />
      
      <div className={`relative z-10 flex-1 flex flex-col justify-between ${textClass}`}>
        <div className="mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 origin-left drop-shadow-md">{icon}</div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1 drop-shadow-sm">{title}</p>
          <p className="text-[22px] font-extrabold leading-none mb-1 drop-shadow-sm">{value}</p>
          <p className={`text-[11px] font-medium drop-shadow-sm ${subtitleClass || 'text-white/90'}`}>{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function BusinessHubHome() {
  const { user, setActivePage } = useAppStore()
  const incomeEntries = useIncomeStore((s) => s.entries)
  const scheduleTasks = useScheduleStore((s) => s.tasks)
  const gymSessions = useGymStore((s) => s.sessions)
  const savingsEntries = useSavingsStore((s) => s.entries)

  const firstName = (user?.displayName ?? 'Farid').split(' ')[0]

  const [selectedDateISO, setSelectedDateISO] = useState(toISO(new Date()))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const now = new Date(selectedDateISO + 'T00:00:00')
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const todayISO = selectedDateISO

  // XP & Streak
  const totalTasksDone = scheduleTasks.filter(t => t.isCompleted).length
  const totalGymDone = gymSessions.filter(s => s.isCompleted).length
  const xp = (totalTasksDone * 10) + (totalGymDone * 50) + 6000 

  const streak = useMemo(() =>
    computeStreak(gymSessions.filter((s) => s.isCompleted).map((s) => s.date)),
  [gymSessions])

  // Income
  const thisMonthIncome = useMemo(() =>
    incomeEntries
      .filter((e) => e.date.startsWith(thisMonthKey))
      .reduce((s, e) => s + (e.type === 'expense' ? -e.amount : e.amount), 0),
  [incomeEntries, thisMonthKey])
  
  const expense = thisMonthIncome * 0.05
  const netBalance = thisMonthIncome - expense

  // Schedule / Habits
  const monthTasks = scheduleTasks.filter((t) => t.date.startsWith(thisMonthKey))
  const monthDone = monthTasks.filter((t) => t.isCompleted)
  
  // Daily Progress
  const todayTasks = scheduleTasks.filter(t => t.date === todayISO)
  const todayDone = todayTasks.filter(t => t.isCompleted)
  const dailyPct = todayTasks.length > 0 ? Math.round((todayDone.length / todayTasks.length) * 100) : 0
  
  // Period breakdown
  const morningTasks = todayTasks.filter(t => t.period === 'Morning')
  const afternoonTasks = todayTasks.filter(t => t.period === 'Afternoon')
  const nightTasks = todayTasks.filter(t => t.period === 'Night')
  
  const mPct = morningTasks.length ? Math.round((morningTasks.filter(t => t.isCompleted).length / morningTasks.length) * 100) : 0
  const aPct = afternoonTasks.length ? Math.round((afternoonTasks.filter(t => t.isCompleted).length / afternoonTasks.length) * 100) : 0
  const nPct = nightTasks.length ? Math.round((nightTasks.filter(t => t.isCompleted).length / nightTasks.length) * 100) : 0

  const gymThisWeek = gymSessions.filter(s => s.date >= toISO(new Date(now.getTime() - 7 * 86400000)) && s.isCompleted).length

  const totalSavings = useMemo(() =>
    savingsEntries.reduce((sum, e) => sum + e.amount, 0),
  [savingsEntries])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5 pb-8">
      
      {/* ── Hero Greeting ── */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-blue-500/20 relative overflow-hidden mb-6">
        {/* Ambient blobs & Grid */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
             <div>
               <motion.button 
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setShowDatePicker(true)}
                 className="flex items-center gap-2 mb-3 bg-white/10 w-max px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 transition-colors relative"
               >
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                 <span className="text-blue-50 text-[10px] font-bold uppercase tracking-widest drop-shadow-sm">
                   {now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                 </span>
               </motion.button>
               <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm mb-1.5">
                 Farid Dashboard
               </h1>
               <p className="text-blue-100 font-medium text-sm drop-shadow-sm">
                 Hello, {firstName} 👋 <span className="opacity-60 mx-1">•</span> {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
             </div>
          </div>

          {/* Today progress */}
          <div className="mt-1 flex items-center gap-3.5 bg-white/15 rounded-2xl px-4 py-3.5 backdrop-blur-md border border-white/20 shadow-sm transition-transform duration-300 hover:scale-[1.01]">
            <div className="bg-white/20 p-2 rounded-xl shadow-inner text-amber-300">
               <Zap size={18} fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-blue-50 text-xs font-bold uppercase tracking-wider">Today's Tasks</span>
                <span className="text-white text-xs font-extrabold bg-white/20 px-2.5 py-0.5 rounded-md shadow-sm">{todayDone.length}/{todayTasks.length}</span>
              </div>
              <div className="h-2 rounded-full bg-black/20 overflow-hidden shadow-inner border border-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-300 to-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  initial={{ width: 0 }}
                  animate={{ width: todayTasks.length > 0 ? `${(todayDone.length / todayTasks.length) * 100}%` : '0%' }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Square Core Metrics ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <MetricSquare
          gradientClass="bg-gradient-to-br from-rose-500 to-orange-500" textClass="text-white"
          icon={<div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 border border-white/20 backdrop-blur-sm"><Flame size={18} /></div>}
          title="Habit Streak" value={`${streak} Days`} subtitle="Keep going!"
        />
        <MetricSquare
          gradientClass="bg-gradient-to-br from-blue-500 to-indigo-600" textClass="text-white"
          icon={<div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 border border-white/20 backdrop-blur-sm"><DollarSign size={18} /></div>}
          title="Monthly Income" value={formatRpShort(thisMonthIncome)} subtitle="This month"
        />
        <MetricSquare
          gradientClass="bg-gradient-to-br from-purple-500 to-fuchsia-600" textClass="text-white"
          icon={<div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 border border-white/20 backdrop-blur-sm"><PiggyBank size={18} /></div>}
          title="Saving" value={formatRpShort(totalSavings)} subtitle="Keep it up!"
        />
        <MetricSquare
          gradientClass="bg-gradient-to-br from-emerald-500 to-teal-600" textClass="text-white"
          icon={<div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 border border-white/20 backdrop-blur-sm"><Dumbbell size={18} /></div>}
          title="Gym Progress" value={`${gymThisWeek}/7 Days`} subtitle="This week"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ── Daily Progress ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
        
        <div className="flex items-center gap-2.5 mb-6 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
            <Target size={16} />
          </div>
          <h3 className="text-slate-800 dark:text-white font-extrabold text-lg tracking-tight">Daily Progress</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Circular Gauge */}
          <div className="relative w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
            <svg className="w-28 h-28 -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
              {/* Inner Background Circle */}
              <circle cx="50" cy="50" r="42" className="fill-white dark:fill-slate-900" />
              {/* Track */}
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
              {/* Progress */}
              <motion.circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-blue-500"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - dailyPct / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none tracking-tight -ml-0.5">{dailyPct}%</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Done</span>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="flex-1 w-full space-y-3">
            {[
              { label: 'Morning', pct: mPct, color: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50/50 dark:bg-amber-500/5', shadow: 'shadow-orange-500/20' },
              { label: 'Afternoon', pct: aPct, color: 'from-blue-400 to-indigo-500', lightBg: 'bg-blue-50/50 dark:bg-blue-500/5', shadow: 'shadow-blue-500/20' },
              { label: 'Night', pct: nPct, color: 'from-indigo-400 to-purple-500', lightBg: 'bg-indigo-50/50 dark:bg-indigo-500/5', shadow: 'shadow-purple-500/20' },
            ].map((period) => (
              <div key={period.label} className={`p-2.5 rounded-2xl ${period.lightBg} border border-white dark:border-white/5 shadow-sm`}>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">{period.label}</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{period.pct}%</span>
                </div>
                <div className="h-2 bg-slate-200/50 dark:bg-slate-800/80 rounded-full overflow-hidden mx-1 backdrop-blur-sm">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${period.pct}%` }} transition={{ duration: 1, delay: 0.2 }} 
                    className={`h-full rounded-full bg-gradient-to-r ${period.color} shadow-sm ${period.shadow}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Monthly Finance ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8 transition-transform duration-700 hover:scale-150" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-8 -mb-8 transition-transform duration-700 hover:scale-150" />

        <div className="relative z-10 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
            <h3 className="text-slate-800 dark:text-white font-extrabold text-lg tracking-tight">Monthly Finance</h3>
          </div>
        </div>
        
        <div className="relative z-10 mb-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl px-4 py-2.5 shadow-md shadow-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white/30 rounded-full" />
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">Net Balance</p>
          </div>
          <h2 className="text-lg font-black text-white drop-shadow-sm">
            {formatRp(netBalance)}
          </h2>
        </div>
        
        <div className="relative z-10 flex items-center bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-inner">
          {/* Income */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
               <TrendingUp size={14} className="text-emerald-500 dark:text-emerald-400" />
               <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase">Income</span>
            </div>
            <p className="text-slate-800 dark:text-white font-extrabold text-base text-center">{formatRp(thisMonthIncome)}</p>
          </div>
          
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 rounded-full mx-2" />
          
          {/* Expense */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
               <TrendingDown size={14} className="text-rose-500 dark:text-rose-400" />
               <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-widest uppercase">Expense</span>
            </div>
            <p className="text-slate-800 dark:text-white font-extrabold text-base text-center">{formatRp(expense)}</p>
          </div>
        </div>
      </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-600 text-amber-300 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Zap size={16} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5">
          {[
            { label: 'Check Habits', icon: <CheckSquare size={18} className="text-white drop-shadow-sm" />, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500', action: () => setActivePage('schedule') },
            { label: 'Add Income', icon: <DollarSign size={18} className="text-white drop-shadow-sm" />, gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500', action: () => setActivePage('income') },
            { label: 'Log Workout', icon: <Dumbbell size={18} className="text-white drop-shadow-sm" />, gradient: 'bg-gradient-to-br from-orange-400 to-rose-500', action: () => setActivePage('gym') },
            { label: 'Savings', icon: <PiggyBank size={18} className="text-white drop-shadow-sm" />, gradient: 'bg-gradient-to-br from-purple-400 to-fuchsia-500', action: () => setActivePage('savings') },
          ].map(action => (
            <motion.button key={action.label} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={action.action}
              className={`group relative overflow-hidden rounded-[1.25rem] p-4 flex flex-col items-center justify-center gap-2.5 border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] ${action.gradient}`}
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/20" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-md pointer-events-none transition-transform duration-500 group-hover:scale-150" />
              
              <div className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center bg-white/20 border border-white/30 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 group-hover:bg-white/30">
                {action.icon}
              </div>
              <span className="relative z-10 text-white font-bold text-sm tracking-wide transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">{action.label}</span>
            </motion.button>
          ))}
          </div>
        </div>
      </div>

      {/* Render Calendar Picker at root to avoid stacking context issues */}
      <AnimatePresence>
        {showDatePicker && (
          <CalendarPicker
            selectedDate={selectedDateISO}
            onSelect={(iso) => setSelectedDateISO(iso)}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
