// src/components/gym/GymSessionCard.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Clock, ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import { useGymStore } from '../../store/gymStore'
import type { GymSession, WorkoutType } from '../../types/gym'

const TYPE_META: Record<WorkoutType, { emoji: string; grad: string; text: string }> = {
  Push:         { emoji: '💪', grad: 'from-orange-400 to-red-500',    text: 'text-orange-600 dark:text-orange-400' },
  Pull:         { emoji: '🏋️', grad: 'from-blue-400 to-cyan-500',     text: 'text-blue-600 dark:text-blue-400' },
  Legs:         { emoji: '🦵', grad: 'from-emerald-400 to-teal-500',  text: 'text-emerald-600 dark:text-emerald-400' },
  Cardio:       { emoji: '🏃', grad: 'from-pink-400 to-rose-500',     text: 'text-pink-600 dark:text-pink-400' },
  'Upper Body': { emoji: '🦾', grad: 'from-violet-400 to-purple-500', text: 'text-violet-600 dark:text-violet-400' },
  'Full Body':  { emoji: '⚡', grad: 'from-amber-400 to-orange-500',  text: 'text-amber-600 dark:text-amber-400' },
  'Rest Day':   { emoji: '😴', grad: 'from-slate-400 to-slate-500',   text: 'text-slate-500 dark:text-slate-400' },
  Custom:       { emoji: '✏️', grad: 'from-indigo-400 to-blue-500',   text: 'text-indigo-600 dark:text-indigo-400' },
}

function formatDate(iso: string) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (iso === today) return 'Today'
  if (iso === yesterday) return 'Yesterday'
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  session: GymSession
  index: number
}

export default function GymSessionCard({ session, index }: Props) {
  const { toggleSession, deleteSession } = useGymStore()
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [justToggled, setJustToggled] = useState(false)

  const meta = TYPE_META[session.type]

  function handleToggle() {
    setJustToggled(true)
    setTimeout(() => setJustToggled(false), 500)
    toggleSession(session.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 14, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        session.isCompleted
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]'
          : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-700 opacity-70'
      }`}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Workout type pill */}
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.grad} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
          {session.type === 'Custom' && session.customEmoji ? session.customEmoji : meta.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {session.type === 'Custom' && session.customName ? session.customName : session.type}
            </p>
            {session.durationMin && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                <Clock size={9} />
                {session.durationMin}m
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(session.date)}</p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            id={`gym-toggle-${session.id}`}
            animate={justToggled ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={(e) => { e.stopPropagation(); handleToggle() }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              session.isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            {session.isCompleted
              ? <><CheckCircle2 size={11} /> Done</>
              : <><Circle size={11} /> Pending</>}
          </motion.button>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-300 dark:text-slate-600"
          >
            <ChevronDown size={15} />
          </motion.div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
              {session.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2">
                  "{session.notes}"
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  id={`gym-delete-${session.id}`}
                  onClick={confirmDelete ? () => deleteSession(session.id) : () => setConfirmDelete(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    confirmDelete
                      ? 'bg-red-500 text-white'
                      : 'text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                  }`}
                >
                  <Trash2 size={11} />
                  {confirmDelete ? 'Confirm Delete?' : 'Delete'}
                </button>
                {confirmDelete && (
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
