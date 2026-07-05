// src/components/gym/GymAddForm.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, StickyNote, X, CheckCircle2, CalendarDays, Trash2, Check } from 'lucide-react'
import { useGymStore } from '../../store/gymStore'
import CalendarPicker from '../schedule/CalendarPicker'
import CustomDurationPicker from './CustomDurationPicker'
import type { WorkoutType, GymSession } from '../../types/gym'

interface WorkoutOption {
  type: WorkoutType
  emoji: string
  color: string
  activeColor: string
}

const WORKOUT_OPTIONS: WorkoutOption[] = [
  { type: 'Push',       emoji: '💪', color: 'text-orange-500', activeColor: 'from-orange-400 to-red-500' },
  { type: 'Pull',       emoji: '🏋️', color: 'text-blue-500',   activeColor: 'from-blue-400 to-cyan-500' },
  { type: 'Legs',       emoji: '🦵', color: 'text-emerald-500', activeColor: 'from-emerald-400 to-teal-500' },
  { type: 'Cardio',     emoji: '🏃', color: 'text-pink-500',   activeColor: 'from-pink-400 to-rose-500' },
  { type: 'Upper Body', emoji: '🦾', color: 'text-violet-500', activeColor: 'from-violet-400 to-purple-500' },
  { type: 'Full Body',  emoji: '⚡', color: 'text-amber-500',  activeColor: 'from-amber-400 to-orange-500' },
  { type: 'Rest Day',   emoji: '😴', color: 'text-slate-400',  activeColor: 'from-slate-400 to-slate-500' },
  { type: 'Custom',     emoji: '✏️', color: 'text-indigo-500', activeColor: 'from-indigo-400 to-blue-500' },
]

interface Props {
  defaultDate: string
  existingSession?: GymSession
  onClose: () => void
}

export default function GymAddForm({ defaultDate, existingSession, onClose }: Props) {
  const addSession = useGymStore((s) => s.addSession)
  const updateSession = useGymStore((s) => s.updateSession)
  const deleteSession = useGymStore((s) => s.deleteSession)

  const [workoutType, setWorkoutType] = useState<WorkoutType>(existingSession?.type || 'Push')
  const [date, setDate] = useState(existingSession?.date || defaultDate)
  const [notes, setNotes] = useState(existingSession?.notes || '')
  const [duration, setDuration] = useState<number | ''>(existingSession?.durationMin || '')
  const [customName, setCustomName] = useState(existingSession?.customName || '')
  const [customEmoji, setCustomEmoji] = useState(existingSession?.customEmoji || '✏️')
  const [isCompleted, setIsCompleted] = useState(existingSession ? existingSession.isCompleted : true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!date) return setError('Please pick a date.')

    setSaving(true)
    try {
      const sessionData: any = {
        type: workoutType,
        date,
        notes: notes.trim(),
        isCompleted,
      }
      
      if (duration) sessionData.durationMin = Number(duration)
      if (workoutType === 'Custom') {
        sessionData.customName = customName.trim()
        sessionData.customEmoji = customEmoji
      }
      
      if (existingSession) {
        updateSession(existingSession.id, sessionData)
      } else {
        addSession(sessionData)
      }
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 800)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-[0_32px_64px_rgba(0,0,0,0.4)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-slate-200/50 dark:border-slate-800/50 overflow-y-auto max-h-[90vh]"
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2 className="text-[19px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            {existingSession ? 'Edit Session' : 'Log Session'}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            {existingSession ? 'Update your workout details' : "Record today's workout"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {existingSession && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {/* Workout type grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Workout Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {WORKOUT_OPTIONS.map((opt) => {
              const active = workoutType === opt.type
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setWorkoutType(opt.type)}
                  className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-2xl text-[10px] sm:text-[11px] font-bold transition-all duration-300 ${
                    active
                      ? `bg-gradient-to-br ${opt.activeColor} text-white shadow-lg scale-[1.03]`
                      : 'bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:scale-[1.02] hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm'
                  }`}
                >
                  <span className="text-xl sm:text-2xl leading-none">{opt.emoji}</span>
                  <span className="text-center">{opt.type}</span>
                </button>
              )
            })}
          </div>
          {/* Custom Name Input */}
          <AnimatePresence>
            {workoutType === 'Custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div>
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10 text-base"
                    >
                      {customEmoji}
                    </button>
                    <input
                      type="text"
                      placeholder="E.g., Swimming, Yoga, Stretching..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                    {customName.trim() && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm z-10"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  
                  {/* Mini Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
                          <div className="grid grid-cols-7 gap-1">
                            {['✏️', '⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🏸', '🏒', '🥊', '🥋', '🚴', '🏊', '🧗', '🧘', '🤸', '🩰', '🏄', '🛹', '🏌️', '🤿'].map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setCustomEmoji(emoji)
                                  setShowEmojiPicker(false)
                                }}
                                className="w-8 h-8 mx-auto flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date + Duration row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Date</label>
            <div className="relative cursor-pointer group" onClick={() => setShowCalendar(true)}>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:text-blue-500 text-slate-400">
                <CalendarDays size={14} />
              </div>
              <input
                type="text"
                readOnly
                value={new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-[13px] font-semibold cursor-pointer group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 transition-all shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Duration <span className="font-medium text-slate-400 normal-case">(min)</span>
            </label>
            <CustomDurationPicker value={duration} onChange={setDuration} />
          </div>
        </div>

        {/* Completed toggle */}
        <div className="flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
               <Dumbbell size={14} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">Mark as completed</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Did you finish this session?</p>
            </div>
          </div>
          <button
            type="button"
            id="gym-completed-toggle"
            onClick={() => setIsCompleted(!isCompleted)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <motion.div
              animate={{ x: isCompleted ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            />
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            Notes <span className="font-medium text-slate-400 normal-case">(optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute left-3.5 top-4 pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
              <StickyNote size={14} />
            </div>
            <textarea
              id="gym-notes"
              rows={2}
              placeholder="Sets, reps, feelings…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-[13px] font-medium placeholder-slate-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="btn-save-session"
          type="submit"
          disabled={saving || success}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] sm:text-sm font-semibold py-2.5 sm:py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95 disabled:opacity-70"
        >
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span key="ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <CheckCircle2 size={15} /> Logged! 💪
              </motion.span>
            ) : saving ? (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saving…</motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {existingSession ? 'Save Changes' : 'Log Session'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && existingSession && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-transparent"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[280px] bg-white dark:bg-[#0B1120] rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 p-5 text-center overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Session?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteSession(existingSession.id)
                    setShowDeleteConfirm(false)
                    onClose()
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/25 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <CalendarPicker
            selectedDate={date}
            onSelect={(iso) => {
              setDate(iso)
              setShowCalendar(false)
            }}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
