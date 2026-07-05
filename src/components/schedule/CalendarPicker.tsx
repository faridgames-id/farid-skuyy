import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

interface Props {
  selectedDate: string
  onSelect: (isoDate: string) => void
  onClose: () => void
}

export default function CalendarPicker({ selectedDate, onSelect, onClose }: Props) {
  // viewDate determines which month is being displayed in the calendar
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate + 'T00:00:00'))

  const todayIso = toISO(new Date())

  function shiftMonth(delta: number) {
    setViewDate(prev => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  // Calculate days for the grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1)
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDayOfMonth.getDate()
    const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.

    const days = []

    // Padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const d = new Date(year, month, -startDayOfWeek + i + 1)
      days.push({
        iso: toISO(d),
        num: d.getDate(),
        isCurrentMonth: false,
      })
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      days.push({
        iso: toISO(d),
        num: i,
        isCurrentMonth: true,
      })
    }

    // Padding days for next month to complete the last row (up to 42 days total)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({
        iso: toISO(d),
        num: i,
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewDate])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white dark:bg-[#0B1120] rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          <button onClick={() => shiftMonth(-1)} className="p-1 hover:bg-white/20 rounded-xl transition-colors relative z-10">
            <ChevronLeft size={18} />
          </button>
          
          <div className="text-center relative z-10">
            <h3 className="font-extrabold text-[15px] tracking-wide">
              {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <button onClick={() => shiftMonth(1)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors relative z-10">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-3">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-1">
            {calendarDays.map((d, i) => {
              const isSelected = d.iso === selectedDate
              const isToday = d.iso === todayIso
              
              let btnClass = "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[13px] font-semibold transition-all "
              
              if (isSelected) {
                btnClass += "bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110 "
              } else if (isToday) {
                btnClass += "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 "
              } else if (d.isCurrentMonth) {
                btnClass += "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 "
              } else {
                btnClass += "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 "
              }

              return (
                <div key={i} className="py-0.5">
                  <button
                    onClick={() => {
                      onSelect(d.iso)
                      onClose()
                    }}
                    className={btnClass}
                  >
                    {d.num}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
             <button 
                onClick={onClose}
                className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
             >
               Batal
             </button>
             <button 
                onClick={() => {
                  onSelect(todayIso)
                  onClose()
                }}
                className="px-3 py-1.5 text-[11px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
             >
               Hari Ini
             </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
