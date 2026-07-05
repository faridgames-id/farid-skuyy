// src/store/scheduleStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from './appStore'
import type { ScheduleTask, Period } from '../types/schedule'

interface ScheduleState {
  tasks: ScheduleTask[]
  setTasks: (tasks: ScheduleTask[]) => void
  addTask: (task: Omit<ScheduleTask, 'id' | 'createdAt'>) => string
  syncTask: (task: ScheduleTask) => void
  toggleTask: (id: string, date: string) => void
  deleteTask: (id: string) => void
  updateTask: (id: string, patch: Partial<Pick<ScheduleTask, 'task' | 'period' | 'time'>>) => void
}

function generateId() {
  return `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => {
        const id = generateId()
        const newTask = { ...task, id, createdAt: Date.now() }
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))
        const user = useAppStore.getState().user
        if (user) {
          setDoc(doc(db, 'users', user.uid, 'schedule', id), newTask).catch(console.error)
        }
        return id
      },

      syncTask: (task) => {
        set((state) => {
          const exists = state.tasks.some(t => t.id === task.id)
          if (exists) {
            return { tasks: state.tasks.map(t => t.id === task.id ? task : t) }
          }
          return { tasks: [...state.tasks, task] }
        })
      },

      toggleTask: (id, date) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t
            
            // Legacy task conversion or initialize array
            const currentDates = t.completedDates || []
            let newDates = [...currentDates]
            
            if (newDates.includes(date)) {
              newDates = newDates.filter(d => d !== date)
            } else {
              newDates.push(date)
            }
            
            return { ...t, completedDates: newDates, isCompleted: newDates.includes(t.date) }
          }),
        }))
        
        const user = useAppStore.getState().user
        if (user) {
          const updated = useScheduleStore.getState().tasks.find(t => t.id === id)
          if (updated) {
            updateDoc(doc(db, 'users', user.uid, 'schedule', id), { 
              completedDates: updated.completedDates,
              isCompleted: updated.isCompleted 
            }).catch(console.error)
          }
        }
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
        const user = useAppStore.getState().user
        if (user) {
          deleteDoc(doc(db, 'users', user.uid, 'schedule', id)).catch(console.error)
        }
      },

      updateTask: (id, patch) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }))
        const user = useAppStore.getState().user
        if (user) {
          updateDoc(doc(db, 'users', user.uid, 'schedule', id), patch).catch(console.error)
        }
      },
    }),
    { name: 'farid-schedule-store' }
  )
)
