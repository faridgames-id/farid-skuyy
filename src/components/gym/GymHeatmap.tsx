// src/components/gym/GymHeatmap.tsx
// GitHub-style contribution heatmap for the current month
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGymStore } from '../../store/gymStore'
import type { WorkoutType } from '../../types/gym'
import { getLocalISOString, getLocalISOMonth } from '../../utils/date'

const TYPE_COLORS: Record<WorkoutType, string> = {
  Push:         'bg-orange-400',
  Pull:         'bg-blue-400',
  Legs:         'bg-emerald-400',
  Cardio:       'bg-pink-400',
  'Upper Body': 'bg-violet-400',
  'Full Body':  'bg-amber-400',
  'Rest Day':   'bg-slate-300 dark:bg-slate-600',
  Custom:       'bg-indigo-400',
}

function toISO(d: Date) {
  return getLocalISOString(d)
}

interface HeatmapDay {
  iso: string
  day: number
  session: ReturnType<typeof useGymStore.getState>['sessions'][number] | null
  isToday: boolean
  isFuture: boolean
  weekday: number // 0=Sun
}

interface Props {
  year: number
  month: number // 0-indexed
  onDayClick?: (iso: string, session: ReturnType<typeof useGymStore.getState>['sessions'][number] | null) => void
}

export default function GymHeatmap({ year, month, onDayClick }: Props) {
  const sessions = useGymStore((s) => s.sessions)
  const todayISO = toISO(new Date())

  const sessionMap = useMemo(() => {
    const m: Record<string, (typeof sessions)[number]> = {}
    sessions.forEach((s) => { m[s.date] = s })
    return m
  }, [sessions])

  const { days, firstWeekday } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstWeekday = firstDay.getDay() // 0=Sun

    const days: HeatmapDay[] = []
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const iso = toISO(date)
      days.push({
        iso,
        day: d,
        session: sessionMap[iso] ?? null,
        isToday: iso === todayISO,
        isFuture: iso > todayISO,
        weekday: date.getDay(),
      })
    }
    return { days, firstWeekday }
  }, [year, month, sessionMap, todayISO])

  const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((d, idx) => {
          const hasSession = !!d.session
          const isCompleted = d.session?.isCompleted
          const typeColor = d.session ? TYPE_COLORS[d.session.type] : ''

          return (
            <motion.button
              key={d.iso}
              onClick={() => onDayClick && onDayClick(d.iso, d.session)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.008, duration: 0.2 }}
              title={
                d.session
                  ? `${d.session.type === 'Custom' && d.session.customName ? d.session.customName : d.session.type}${d.session.isCompleted ? ' ✓' : ' (pending)'}${d.session.durationMin ? ` – ${d.session.durationMin}min` : ''}`
                  : d.isFuture
                  ? 'Future'
                  : 'No session'
              }
              className={`
                aspect-square rounded-lg flex items-center justify-center relative transition-all duration-200
                ${d.isToday ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-slate-900' : ''}
                ${d.isFuture
                  ? 'bg-slate-50 dark:bg-slate-800/40 opacity-40'
                  : hasSession
                  ? `${typeColor} ${isCompleted ? 'opacity-90 hover:opacity-100 hover:scale-105 shadow-sm' : 'opacity-40 hover:opacity-60'}`
                  : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer hover:scale-105'}
              `}
            >
              <span className={`text-[9px] font-bold leading-none ${
                hasSession && isCompleted ? 'text-white' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {d.day}
              </span>
              {/* Completed checkmark dot */}
              {isCompleted && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white ring-1 ring-emerald-400 shadow-sm" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {(Object.entries(TYPE_COLORS) as [WorkoutType, string][])
          .filter(([t]) => t !== 'Rest Day' && t !== 'Custom')
          .map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{type}</span>
            </div>
          ))}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600" />
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Rest</span>
        </div>
      </div>
    </div>
  )
}
