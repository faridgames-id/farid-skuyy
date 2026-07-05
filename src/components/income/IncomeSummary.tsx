// src/components/income/IncomeSummary.tsx
// Monthly summary card with a mini Recharts bar chart
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useIncomeStore } from '../../store/incomeStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function formatRpShort(n: number) {
  return n.toLocaleString('id-ID')
}

function formatRpFull(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace('IDR', 'Rp')
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold mb-0.5">{payload[0].payload.fullLabel}</p>
      <p className="text-emerald-400">{formatRpFull(payload[0].value)}</p>
    </div>
  )
}

interface IncomeSummaryProps {
  viewMonth: Date
  setViewMonth: (d: Date) => void
}

export default function IncomeSummary({ viewMonth, setViewMonth }: IncomeSummaryProps) {
  const entries = useIncomeStore((s) => s.entries)
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const thisYear = viewMonth.getFullYear()
  const thisMonth = viewMonth.getMonth()

  const currentMonthKey = `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`
  const lastMonthKey = `${thisMonth === 0 ? thisYear - 1 : thisYear}-${String(thisMonth === 0 ? 12 : thisMonth).padStart(2, '0')}`

  const thisTotal = useMemo(() => entries
    .filter(e => e.date.startsWith(currentMonthKey))
    .reduce((s, e) => s + (e.type === 'expense' ? -e.amount : e.amount), 0),
  [entries, currentMonthKey])

  const lastTotal = useMemo(() => entries
    .filter(e => e.date.startsWith(lastMonthKey))
    .reduce((s, e) => s + (e.type === 'expense' ? -e.amount : e.amount), 0),
  [entries, lastMonthKey])

  const chartData = useMemo(() => {
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
    const monthShort = viewMonth.toLocaleDateString('id-ID', { month: 'short' })
    
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      fullLabel: `${i + 1} ${monthShort}`,
      total: 0,
      cumulative: 0,
    }))
    
    entries.forEach(e => {
      if (e.date.startsWith(currentMonthKey)) {
        const d = parseInt(e.date.slice(8, 10), 10)
        const amt = e.type === 'expense' ? -e.amount : e.amount
        days[d - 1].total += amt
      }
    })
    
    let run = 0
    days.forEach(d => {
      run += d.total
      d.cumulative = run
    })
    
    return days
  }, [entries, currentMonthKey, thisYear, thisMonth, viewMonth])

  const maxTotal = Math.max(...chartData.map((d) => d.cumulative), 1)
  const minTotal = Math.min(...chartData.map((d) => d.cumulative), 0)

  const diff = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : null
  const isUp = diff !== null && diff >= 0
  const TrendIcon = diff === null ? Minus : isUp ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 shadow-xl shadow-emerald-500/25 relative"
    >
      {/* Pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
      </div>

      <div className="relative z-10">
        {/* Title + trend */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 relative">
              <button 
                onClick={() => setViewMonth(new Date(thisYear, thisMonth - 1, 1))}
                className="p-1 rounded-lg hover:bg-white/20 text-emerald-100 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setShowMonthPicker(!showMonthPicker)} className="text-emerald-100 text-xs font-semibold uppercase tracking-wider hover:bg-white/20 px-2 py-0.5 rounded transition-colors">
                {viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </button>
              <button 
                onClick={() => setViewMonth(new Date(thisYear, thisMonth + 1, 1))}
                className="p-1 rounded-lg hover:bg-white/20 text-emerald-100 transition-colors"
              >
                <ChevronRight size={14} />
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
                      className="absolute top-full left-0 mt-2.5 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)] border border-slate-200/60 dark:border-slate-700/60 w-64 z-50"
                    >
                      <div className="flex justify-between items-center mb-3.5 px-1.5">
                        <button onClick={() => setViewMonth(new Date(thisYear - 1, thisMonth, 1))} className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronLeft size={14}/></button>
                        <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 tracking-wide">
                          {thisYear}
                        </span>
                        <button onClick={() => setViewMonth(new Date(thisYear + 1, thisMonth, 1))} className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronRight size={14}/></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                          <button
                            key={m}
                            onClick={() => {
                              setViewMonth(new Date(thisYear, i, 1));
                              setShowMonthPicker(false);
                            }}
                            className={'py-2 rounded-xl text-xs font-bold transition-all duration-300 ' + (
                              thisMonth === i
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-105'
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
            <p className="text-3xl font-extrabold text-white mt-1 leading-none">
              {formatRpFull(thisTotal)}
            </p>
          </div>
          {diff !== null && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold mt-1 ${
                isUp
                  ? 'bg-white/20 text-white'
                  : 'bg-red-400/30 text-red-100'
              }`}
            >
              <TrendIcon size={12} />
              {Math.abs(diff).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-emerald-100/70 text-xs mb-4">
          vs last month: {formatRpFull(lastTotal)}
        </p>

        {/* Line chart */}
        <div className="h-28 mt-2 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis hide domain={[minTotal * 1.1, maxTotal * 1.1]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="white" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#10B981', stroke: 'white', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
