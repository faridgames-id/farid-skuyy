// src/components/schedule/PeriodBlock.tsx
// A collapsible section for one time period (Morning / Afternoon / Night)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import type { Period, ScheduleTask } from '../../types/schedule'
import TaskItem from './TaskItem'

interface PeriodMeta {
  id: Period
  label: string
  timeRange: string
  emoji: string
  gradient: string
  ring: string
  bg: string
  textColor: string
}

export const PERIODS: PeriodMeta[] = [
  {
    id: 'Morning',
    label: 'Morning',
    timeRange: '06:00 – 12:00',
    emoji: '🌅',
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-400/30',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'Afternoon',
    label: 'Afternoon',
    timeRange: '12:00 – 18:00',
    emoji: '☀️',
    gradient: 'from-blue-400 to-cyan-500',
    ring: 'ring-blue-400/30',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'Night',
    label: 'Night',
    timeRange: '18:00 – 24:00',
    emoji: '🌙',
    gradient: 'from-indigo-500 to-violet-600',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-50 dark:bg-indigo-900/10',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
]

interface Props {
  period: PeriodMeta
  tasks: ScheduleTask[]
  selectedDate: string
  onAddClick: (period: Period) => void
}

export default function PeriodBlock({ period, tasks, selectedDate, onAddClick }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const total = tasks.length
  const done = tasks.filter((t) => 
    t.completedDates?.includes(selectedDate) || (t.date === selectedDate && t.isCompleted)
  ).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] p-4 transition-all duration-300 ${collapsed ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)]'}`}>
      {/* Subtle background glow for the period */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none bg-gradient-to-br ${period.gradient}`} />
      
      {/* Period header */}
      <div
        id={`period-header-${period.id}`}
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3.5 group cursor-pointer relative z-10"
      >
        {/* Emoji circle */}
        <div className={`w-12 h-12 rounded-[1rem] bg-gradient-to-br ${period.gradient} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
          {period.emoji}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{period.label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{period.timeRange}</span>
          </div>
          {/* Mini progress bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${period.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-[10px] font-bold ${period.textColor}`}>
              {done}/{total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Add mini button */}
          <button
            type="button"
            onClick={(e) => { 
              e.preventDefault()
              e.stopPropagation()
              onAddClick(period.id) 
            }}
            id={`add-task-${period.id}`}
            className={`w-8 h-8 rounded-[0.75rem] bg-slate-100 dark:bg-slate-800 hover:bg-gradient-to-br hover:${period.gradient} flex items-center justify-center text-slate-500 hover:text-white dark:text-slate-400 shadow-sm transition-all active:scale-90`}
          >
            <Plus size={15} />
          </button>

          {/* Collapse arrow */}
          <motion.div
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-300 dark:text-slate-600"
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </div>

      {/* Task list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden relative z-10"
          >
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl ${period.bg} border border-dashed border-slate-200 dark:border-slate-700`}
                >
                  <span className="text-sm">{period.emoji}</span>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    No {period.label.toLowerCase()} tasks yet.{' '}
                    <button
                      onClick={() => onAddClick(period.id)}
                      className={`font-semibold ${period.textColor} hover:underline`}
                    >
                      Add one
                    </button>
                  </p>
                </motion.div>
              ) : (
                tasks
                  .sort((a, b) => {
                    // Sort: incomplete first, then by time
                    const aCompleted = a.completedDates?.includes(selectedDate) || (a.date === selectedDate && a.isCompleted)
                    const bCompleted = b.completedDates?.includes(selectedDate) || (b.date === selectedDate && b.isCompleted)
                    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1
                    return (a.time ?? '').localeCompare(b.time ?? '')
                  })
                  .map((t, i) => <TaskItem key={t.id} task={t} index={i} selectedDate={selectedDate} />)
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
