// src/components/schedule/TaskItem.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Clock } from 'lucide-react'
import { useScheduleStore } from '../../store/scheduleStore'
import type { ScheduleTask } from '../../types/schedule'

interface Props {
  task: ScheduleTask
  index: number
  selectedDate: string
}

export default function TaskItem({ task, index, selectedDate }: Props) {
  const { toggleTask, deleteTask } = useScheduleStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [justDone, setJustDone] = useState(false)

  // Determine if task is completed on the selected date
  const isCompleted = task.completedDates?.includes(selectedDate) || (task.date === selectedDate && task.isCompleted)

  function handleToggle() {
    if (!isCompleted) {
      // Trigger celebration flash
      setJustDone(true)
      setTimeout(() => setJustDone(false), 600)
    }
    toggleTask(task.id, selectedDate)
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteTask(task.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.035, duration: 0.25, ease: 'easeOut' }}
      className={`relative flex items-center gap-3.5 rounded-[1.25rem] px-4 py-3.5 transition-all duration-300 group ${
        isCompleted
          ? 'bg-slate-50/50 dark:bg-slate-800/30 opacity-70'
          : 'bg-white dark:bg-[#1E293B]/80 shadow-sm hover:shadow-md dark:shadow-none border border-slate-100 dark:border-slate-800 backdrop-blur-md'
      }`}
    >
      {/* Checkbox */}
      <button
        id={`toggle-task-${task.id}`}
        onClick={handleToggle}
        className="mt-0.5 flex-shrink-0 relative"
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {/* Ripple on complete */}
        <AnimatePresence>
          {justDone && (
            <motion.span
              key="ripple"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-blue-400 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={isCompleted ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.25 }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-transparent shadow-sm shadow-blue-500/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-slate-800/50'
          }`}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.svg
                key="check"
                initial={{ opacity: 0, scale: 0.3, pathLength: 0 }}
                animate={{ opacity: 1, scale: 1, pathLength: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.2 }}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <motion.path
                  d="M1.5 5L3.5 7.5L8.5 2.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <p
          className={`text-[15px] font-semibold leading-snug transition-all duration-200 truncate ${
            isCompleted
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-white'
          }`}
        >
          {task.task}
        </p>
        
        {task.time && (
          <div className={`flex items-center gap-2 flex-shrink-0 text-[11px] tracking-wide font-semibold pl-2 pr-2.5 py-1 rounded-lg border ${
            isCompleted 
              ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400/80' 
              : 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-500 dark:text-blue-400'
          }`}>
            <Clock size={13} strokeWidth={1.5} className="opacity-80" />
            <span>{task.time}</span>
          </div>
        )}
      </div>

      {/* Delete button (appears on hover) */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-slate-400 hover:text-slate-600 px-1.5"
          >
            Cancel
          </button>
        )}
        <button
          id={`delete-task-${task.id}`}
          onClick={handleDelete}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            confirmDelete
              ? 'bg-red-500 text-white'
              : 'text-slate-300 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400'
          }`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}
