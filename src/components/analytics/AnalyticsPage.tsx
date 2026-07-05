// src/components/analytics/AnalyticsPage.tsx
import { Activity, CalendarDays, TrendingDown } from 'lucide-react'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell,
  PieChart, Pie,
} from 'recharts'
import { useIncomeStore } from '../../store/incomeStore'
import { useScheduleStore } from '../../store/scheduleStore'
import { useGymStore } from '../../store/gymStore'
import { useSavingsStore, getWeekStart } from '../../store/savingsStore'
import { useAppStore } from '../../store/appStore'
import SmartAnalyticsCalendar from './SmartAnalyticsCalendar'

function formatRpShort(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

interface TooltipProps { active?: boolean; payload?: any[]; label?: string }

function IncomeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-2xl px-4 py-3 shadow-2xl">
      <p className="font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest text-[9px]">Day {label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between items-center gap-6 mb-1">
           <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize text-[11px]">{p.name}</span>
           <span style={{ color: p.color }} className="font-extrabold text-[13px]">Rp {formatRpShort(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function GymTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function DonutTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p style={{ color: payload[0].payload.fill }} className="font-bold">
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  )
}

// Animated donut center label
function DonutLabel({ cx, cy, rate }: { cx: number; cy: number; rate: number }) {
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900 dark:fill-[#f8fafc]" fontSize={22} fontWeight={800}>
        {rate}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>
        completion
      </text>
    </>
  )
}

export default function AnalyticsPage() {
  const incomeEntries = useIncomeStore((s) => s.entries)
  const scheduleTasks = useScheduleStore((s) => s.tasks)
  const gymSessions = useGymStore((s) => s.sessions)
  const savingsEntries = useSavingsStore((s) => s.entries)
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  
  const year = viewYear
  const month = viewMonth
  const thisMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Daily income for current month
  const dailyIncomeData = useMemo(() => {
    const dayMap: Record<number, { income: number; expense: number }> = {}
    incomeEntries
      .filter((e) => e.date.startsWith(thisMonthKey))
      .forEach((e) => {
        const d = parseInt(e.date.slice(8, 10), 10)
        if (!dayMap[d]) dayMap[d] = { income: 0, expense: 0 }
        if (e.type === 'expense') {
          dayMap[d].expense += e.amount
        } else {
          dayMap[d].income += e.amount
        }
      })
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: dayMap[i + 1]?.income ?? 0,
      expense: dayMap[i + 1]?.expense ?? 0,
    }))
  }, [incomeEntries, thisMonthKey, daysInMonth])

  // Weekly gym & schedule overview (last 6 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; gym: number; tasks: number }[] = []
    for (let w = 5; w >= 0; w--) {
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7)
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 6)
      const startISO = startDate.toISOString().slice(0, 10)
      const endISO = endDate.toISOString().slice(0, 10)
      const label = `W${6 - w}`

      const gymCount = gymSessions.filter(
        (s) => s.isCompleted && s.date >= startISO && s.date <= endISO
      ).length
      const taskCount = scheduleTasks.filter(
        (t) => t.isCompleted && t.date >= startISO && t.date <= endISO
      ).length

      weeks.push({ week: label, gym: gymCount, tasks: taskCount })
    }
    return weeks
  }, [gymSessions, scheduleTasks])

  // Monthly income 6-month overview
  const monthlyIncomeData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthEntries = incomeEntries.filter((e) => e.date.startsWith(key))
      const income = monthEntries.filter((e) => e.type !== 'expense').reduce((s, e) => s + e.amount, 0)
      const expense = monthEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      return {
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        income,
        expense,
      }
    })
  }, [incomeEntries, year, month])

  const totalThisMonth = dailyIncomeData.reduce((s, d) => s + d.income, 0)
  const totalExpenseThisMonth = dailyIncomeData.reduce((s, d) => s + d.expense, 0)
  const gymThisMonth = gymSessions.filter((s) => s.date.startsWith(thisMonthKey) && s.isCompleted).length

  // Task completion rate – used for donut chart
  const monthTasks = scheduleTasks.filter((t) => t.date.startsWith(thisMonthKey))
  const doneTasks = monthTasks.filter((t) => t.isCompleted)
  const taskCompletionRate = (() => {
    if (!monthTasks.length) return 0
    return Math.round((doneTasks.length / monthTasks.length) * 100)
  })()

  const hasAnyData = totalThisMonth > 0 || gymThisMonth > 0

  // Investment streak calculation
  const investmentStreak = useMemo(() => {
    if (!savingsEntries.length) return 0
    const weeksSet = new Set<string>()
    savingsEntries.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00')
      weeksSet.add(getWeekStart(d))
    })
    const sortedWeeks = [...weeksSet].sort((a, b) => b.localeCompare(a))
    const thisWeek = getWeekStart()
    if (!sortedWeeks.includes(thisWeek)) return 0

    let count = 1
    let checkDate = new Date(thisWeek + 'T00:00:00')
    checkDate.setDate(checkDate.getDate() - 7)
    for (let i = 0; i < 52; i++) {
      const w = getWeekStart(checkDate)
      if (sortedWeeks.includes(w)) {
        count++
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }
    return count
  }, [savingsEntries])

  // Total savings this month
  const savingsThisMonth = savingsEntries
    .filter((e) => e.date.startsWith(thisMonthKey))
    .reduce((s, e) => s + e.amount, 0)

  // Donut data
  const donutData = [
    { name: 'Completed', value: doneTasks.length, fill: '#3b82f6' },
    { name: 'Remaining', value: monthTasks.length > 0 ? monthTasks.length - doneTasks.length : 1, fill: isDark ? '#1E293B' : '#e2e8f0' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Hero stats card - Premium Model */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[32px] p-6 sm:p-7 shadow-2xl shadow-indigo-500/25 relative overflow-hidden mb-4 text-white group">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at center, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-[80px] pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:bg-white/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-300/20 blur-[60px] pointer-events-none -translate-x-1/4 translate-y-1/4 group-hover:bg-indigo-300/30 transition-all duration-700" />

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
          {/* Header Row */}
          <div className="flex items-center justify-between">
             <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  {new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
             </div>
             <div className="inline-flex items-center gap-1.5 text-blue-100/80 text-[10px] font-bold uppercase tracking-widest">
                <CalendarDays size={14} className="text-white/60"/> Analytics Hub
             </div>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end justify-between">
             {/* Income Section */}
             <div>
                <p className="text-white/90 text-xs font-bold mb-1 uppercase tracking-wider">Total Income This Month</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg mb-3">Rp {formatRp(totalThisMonth)}</h3>
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm">
                   <TrendingDown size={14} className="text-rose-300" />
                   <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Expense: Rp {formatRpShort(totalExpenseThisMonth)}</span>
                </div>
             </div>
             
             {/* Stats Section */}
             <div className="flex gap-3 sm:w-auto w-full">
                <div className="flex-1 sm:w-32 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-center relative overflow-hidden hover:bg-white/[0.15] transition-colors cursor-default">
                   <div className="absolute -right-4 -top-4 text-white/5 rotate-12">
                      <Activity size={64} />
                   </div>
                   <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5 relative z-10">Productivity</p>
                   <p className="text-2xl font-black tracking-tight drop-shadow-md relative z-10">{taskCompletionRate}%</p>
                </div>
                
                <div className="flex-1 sm:w-32 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-center relative overflow-hidden hover:bg-white/[0.15] transition-colors cursor-default">
                   <div className="absolute -right-4 -top-4 text-white/5 rotate-12">
                      <Activity size={64} />
                   </div>
                   <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5 relative z-10">Workouts</p>
                   <p className="text-2xl font-black tracking-tight drop-shadow-md relative z-10">{gymThisMonth}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ─── SMART CALENDAR ─── */}
      <SmartAnalyticsCalendar 
        viewYear={viewYear} 
        viewMonth={viewMonth} 
        setViewYear={setViewYear} 
        setViewMonth={setViewMonth} 
      />



      {/* ─── CHART 1: Income Deep Dive ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Income vs Expense
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
            Daily trend – {new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="h-56 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyIncomeData}
              margin={{ top: 10, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(v) => v % 5 === 0 || v === 1 ? String(v) : ''}
                interval={0}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => v > 0 ? formatRpShort(v).replace('Rp ', '') : '0'}
                width={36}
              />
              <Tooltip content={<IncomeTooltip />} cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ─── CHART 2: Task Completion Donut ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Productivity Rate</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Task completion – this month</p>
        </div>
        <div className="flex items-center px-5 pb-5 gap-6">
          <div className="w-36 h-36 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                  label={({ cx, cy }) => <DonutLabel cx={cx} cy={cy} rate={taskCompletionRate} />}
                  labelLine={false}
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">This Month</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Completed</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {doneTasks.length > 0 ? doneTasks.length : 74}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700 shadow-sm" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Remaining</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {monthTasks.length > 0 ? monthTasks.length - doneTasks.length : 26}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Tasks</span>
                    <span className="text-xs font-black text-blue-500">
                      {monthTasks.length > 0 ? monthTasks.length : 100}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── CHART 3: Gym & Schedule Overview ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Gym & Schedule Overview
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Monthly consistency – last 6 weeks</p>
        </div>

        <div className="h-56 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}
              margin={{ top: 10, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                width={24}
              />
              <Tooltip content={<GymTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
              <Bar dataKey="gym" name="Gym Sessions" radius={[6, 6, 0, 0]} barSize={12} animationBegin={200} animationDuration={1000}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill="#F97316" />
                ))}
              </Bar>
              <Bar dataKey="tasks" name="Tasks Done" radius={[6, 6, 0, 0]} barSize={12} animationBegin={400} animationDuration={1000}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ─── CHART 4: 6-Month Income Bar ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">6-Month Income Trend</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Monthly totals (Net & Expense)</p>
        </div>
        <div className="h-48 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 4, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => v > 0 ? formatRpShort(v).replace('Rp ', '') : '0'} width={36} />
              <Tooltip content={<IncomeTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
              <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]} barSize={10} animationBegin={300} animationDuration={1000}>
                {monthlyIncomeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.month === new Date().toLocaleDateString('id-ID', { month: 'short' }) ? '#10b981' : '#34d399'}
                  />
                ))}
              </Bar>
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={10} animationBegin={500} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <p className="text-center text-[10px] text-slate-600 font-medium pt-1 pb-1">
        v1.1 | © Farid's
      </p>
    </motion.div>
  )
}

// Demo data when no real data exists yet
const DEMO_INCOME_DATA = [
  { day: 1, income: 1200000, expense: 200000 }, { day: 2, income: 800000, expense: 50000 }, { day: 3, income: 2100000, expense: 150000 },
  { day: 4, income: 500000, expense: 100000 }, { day: 5, income: 3400000, expense: 800000 }, { day: 6, income: 900000, expense: 300000 },
  { day: 7, income: 1800000, expense: 450000 }, { day: 8, income: 600000, expense: 100000 }, { day: 9, income: 2700000, expense: 1200000 },
  { day: 10, income: 1100000, expense: 200000 }, { day: 11, income: 4200000, expense: 1500000 }, { day: 12, income: 800000, expense: 50000 },
  { day: 13, income: 1500000, expense: 250000 }, { day: 14, income: 3100000, expense: 600000 }, { day: 15, income: 700000, expense: 100000 },
  { day: 16, income: 2200000, expense: 800000 }, { day: 17, income: 5000000, expense: 1200000 }, { day: 18, income: 9500000, expense: 3500000 },
  { day: 19, income: 3800000, expense: 900000 }, { day: 20, income: 2100000, expense: 400000 }, { day: 21, income: 1400000, expense: 200000 },
  { day: 22, income: 800000, expense: 300000 }, { day: 23, income: 3200000, expense: 1100000 }, { day: 24, income: 600000, expense: 150000 },
  { day: 25, income: 1900000, expense: 500000 }, { day: 26, income: 4100000, expense: 1200000 }, { day: 27, income: 700000, expense: 200000 },
  { day: 28, income: 2800000, expense: 800000 }, { day: 29, income: 1300000, expense: 400000 }, { day: 30, income: 900000, expense: 200000 },
]

const DEMO_WEEKLY_DATA = [
  { week: 'W1', gym: 3, tasks: 8 }, { week: 'W2', gym: 4, tasks: 11 },
  { week: 'W3', gym: 5, tasks: 9 }, { week: 'W4', gym: 3, tasks: 14 },
  { week: 'W5', gym: 6, tasks: 10 }, { week: 'W6', gym: 4, tasks: 7 },
]
