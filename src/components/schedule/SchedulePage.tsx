// src/components/schedule/SchedulePage.tsx
import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from 'lucide-react'
import { useScheduleStore } from '../../store/scheduleStore'
import { useScheduleFirestore } from '../../hooks/useScheduleFirestore'
import ScheduleAddForm from './ScheduleAddForm'
import PeriodBlock, { PERIODS } from './PeriodBlock'
import CalendarPicker from './CalendarPicker'
import type { Period } from '../../types/schedule'

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDateDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const today = toISO(new Date())
  const tomorrow = toISO(new Date(Date.now() + 86400000))
  const yesterday = toISO(new Date(Date.now() - 86400000))

  if (iso === today) return 'Today'
  if (iso === tomorrow) return 'Tomorrow'
  if (iso === yesterday) return 'Yesterday'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
}

export default function SchedulePage() {
  // Wire Firestore sync (no-ops when unconfigured)
  useScheduleFirestore()

  const tasks = useScheduleStore((s) => s.tasks)

  const [selectedDate, setSelectedDate] = useState(toISO(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [formPeriod, setFormPeriod] = useState<Period>('Morning')
  const [showCalendar, setShowCalendar] = useState(false)

  // Navigate days
  function shiftDay(delta: number) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(toISO(d))
    setShowForm(false)
  }

  // Tasks for selected date (Daily Routines from creation date forwards)
  const dayTasks = useMemo(
    () => tasks.filter((t) => t.date <= selectedDate),
    [tasks, selectedDate]
  )

  const totalTasks = dayTasks.length
  const doneTasks = dayTasks.filter((t) => 
    t.completedDates?.includes(selectedDate) || (t.date === selectedDate && t.isCompleted)
  ).length
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Week strip
  const weekDays = useMemo(() => {
    const selected = new Date(selectedDate + 'T00:00:00')
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(selected)
      d.setDate(selected.getDate() - 3 + i)
      const iso = toISO(d)
      const dayTasks = tasks.filter((t) => t.date === iso)
      return {
        iso,
        dayNum: d.getDate(),
        dayLabel: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        isToday: iso === toISO(new Date()),
        isSelected: iso === selectedDate,
        hasTasks: dayTasks.length > 0,
        allDone: dayTasks.length > 0 && dayTasks.every((t) => t.isCompleted),
      }
    })
  }, [selectedDate, tasks])

  function openFormForPeriod(period: Period) {
    setFormPeriod(period)
    setShowForm(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Date navigation header */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl p-5 shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

        <div className="relative z-10">
          {/* Nav row */}
          <div className="flex flex-col items-center justify-center mb-4 mt-0">
             <div 
               className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-full cursor-pointer mb-2 border border-white/5 shadow-sm"
               onClick={() => setShowCalendar(true)}
             >
                <CalendarDays size={12} className="text-blue-100" />
                <span className="text-blue-50 text-[10px] font-bold tracking-widest uppercase">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <ChevronDown size={12} className="text-blue-200" />
             </div>
             
             <div className="flex items-center justify-between w-full px-2">
                <button
                  id="btn-prev-day"
                  onClick={() => shiftDay(-1)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all shadow-sm border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {formatDateDisplay(selectedDate)}
                </h2>
                <button
                  id="btn-next-day"
                  onClick={() => shiftDay(1)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all shadow-sm border border-white/5"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>

          {/* Week strip */}
          <div className="flex items-center justify-between gap-1 mb-4 bg-black/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {weekDays.map((d) => (
              <button
                key={d.iso}
                onClick={() => { setSelectedDate(d.iso); setShowForm(false) }}
                className={`relative flex-1 flex flex-col items-center py-1.5 rounded-xl transition-colors duration-300 ${
                  d.isSelected
                    ? 'text-blue-600'
                    : 'text-blue-50 hover:bg-white/10'
                }`}
              >
                {d.isSelected && (
                  <motion.div
                    layoutId="active-day-bg"
                    className="absolute inset-0 bg-white rounded-xl shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wider mb-0.5 ${d.isSelected ? 'text-blue-500' : 'text-blue-100/80'}`}>
                  {d.dayLabel}
                </span>
                <span className={`relative z-10 text-sm font-extrabold leading-none ${d.isSelected ? 'text-blue-600' : ''}`}>
                  {d.dayNum}
                </span>
                {/* Dot indicator */}
                <div className="relative z-10 h-1.5 mt-1 flex items-center justify-center">
                   {d.allDone ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                   ) : d.hasTasks ? (
                      <span className={`w-1 h-1 rounded-full ${d.isSelected ? 'bg-blue-300' : 'bg-white/40'}`} />
                   ) : null}
                </div>
              </button>
            ))}
          </div>

          {/* Progress ring + stats */}
          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - completionPct / 100) }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{completionPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">
                {doneTasks} of {totalTasks} done
              </p>
              <p className="text-blue-100/70 text-xs mt-0.5">
                {totalTasks === 0
                  ? 'No tasks yet for this day'
                  : completionPct === 100
                  ? '🎉 All done! Amazing work.'
                  : `${totalTasks - doneTasks} remaining`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <ScheduleAddForm
            defaultDate={selectedDate}
            defaultPeriod={formPeriod}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <CalendarPicker
            selectedDate={selectedDate}
            onSelect={(iso) => {
              setSelectedDate(iso)
              setShowCalendar(false)
            }}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>

      {/* Main add button */}
      {!showForm && (
        <div className="flex justify-end">
          <motion.button
            id="btn-add-task-main"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => openFormForPeriod('Morning')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
          >
            <Plus size={15} />
            Add Task
          </motion.button>
        </div>
      )}

      {/* Period blocks */}
      <div className="space-y-5">
        {PERIODS.map((period) => {
          const periodTasks = dayTasks.filter((t) => t.period === period.id)
          return (
            <PeriodBlock
              key={period.id}
              period={period}
              tasks={periodTasks}
              selectedDate={selectedDate}
              onAddClick={openFormForPeriod}
            />
          )
        })}
      </div>

    </motion.div>
  )
}
