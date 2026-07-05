// src/components/schedule/ScheduleAddForm.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlarmClock, FileText, X, CheckCircle2, Sun, Sunset, Moon } from 'lucide-react'
import { useScheduleStore } from '../../store/scheduleStore'
import type { Period } from '../../types/schedule'
import CalendarPicker from './CalendarPicker'
import CustomTimePicker from './CustomTimePicker'

const PERIOD_OPTIONS: { id: Period; label: string; icon: React.ReactNode; color: string; activeGrad: string }[] = [
  {
    id: 'Morning',
    label: 'Morning',
    icon: <Sun size={14} />,
    color: 'text-amber-500',
    activeGrad: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
  {
    id: 'Afternoon',
    label: 'Afternoon',
    icon: <Sunset size={14} />,
    color: 'text-blue-500',
    activeGrad: 'bg-gradient-to-r from-blue-400 to-cyan-500',
  },
  {
    id: 'Night',
    label: 'Night',
    icon: <Moon size={14} />,
    color: 'text-indigo-500',
    activeGrad: 'bg-gradient-to-r from-indigo-500 to-violet-600',
  },
]

const TASK_PRESETS: Record<Period, string[]> = {
  Morning: ['Morning workout', 'Journaling', 'Read 20 pages', 'Prepare meals', 'Morning standup'],
  Afternoon: ['Deep work block', 'Client meeting', 'Lunch break', 'Code review', 'Email replies'],
  Night: ['Wrap-up tasks', 'Plan tomorrow', 'Read before bed', 'Study session', 'Evening walk'],
}

interface Props {
  defaultDate: string
  defaultPeriod?: Period
  onClose: () => void
}

export default function ScheduleAddForm({ defaultDate, defaultPeriod = 'Morning', onClose }: Props) {
  const addTask = useScheduleStore((s) => s.addTask)

  const [task, setTask] = useState('')
  const [period, setPeriod] = useState<Period>(defaultPeriod)
  const [time, setTime] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!task.trim()) return setError('Please enter a task name.')

    setSaving(true)
    try {
      const taskData: any = { task: task.trim(), period, date, isCompleted: false }
      if (time) taskData.time = time
      addTask(taskData)
      setSuccess(true)
      setTask('')
      setTime('')
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 700)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const presets = TASK_PRESETS[period]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-800/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Task</h2>
          <p className="text-xs text-slate-400 mt-0.5">Schedule a new activity</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Period selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Time of Day
          </label>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((opt) => {
              const active = period === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? `${opt.activeGrad} text-white shadow-md`
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Task input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Task
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center pointer-events-none">
              <FileText size={13} className="text-blue-500" />
            </div>
            <input
              id="schedule-task"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What are you doing?"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTask(p)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  task === p
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Time + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Time <span className="font-normal normal-case text-slate-300 dark:text-slate-600">(opt.)</span>
            </label>
            <CustomTimePicker value={time} onChange={setTime} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <button
              id="schedule-date-btn"
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="btn-save-task"
          type="submit"
          disabled={saving || success}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95 disabled:opacity-70"
        >
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span key="ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <CheckCircle2 size={15} /> Added!
              </motion.span>
            ) : saving ? (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saving…</motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Add Task</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <CalendarPicker
            selectedDate={date}
            onSelect={setDate}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
