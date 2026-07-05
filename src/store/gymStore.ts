// src/store/gymStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from './appStore'
import type { GymSession } from '../types/gym'

interface GymState {
  sessions: GymSession[]
  setSessions: (sessions: GymSession[]) => void
  addSession: (s: Omit<GymSession, 'id' | 'createdAt'>) => string
  syncSession: (s: GymSession) => void
  toggleSession: (id: string) => void
  deleteSession: (id: string) => void
  updateSession: (id: string, patch: Partial<Omit<GymSession, 'id' | 'createdAt'>>) => void
}

function generateId() {
  return `gym-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      sessions: [],
      setSessions: (sessions) => set({ sessions }),

      addSession: (s) => {
        const id = generateId()
        const newSession = { ...s, id, createdAt: Date.now() }
        set((state) => ({
          sessions: [newSession, ...state.sessions],
        }))
        
        const user = useAppStore.getState().user
        if (user) {
          setDoc(doc(db, 'users', user.uid, 'gym', id), newSession).catch(console.error)
        }
        return id
      },

      syncSession: (s) => {
        set((state) => {
          const exists = state.sessions.some(session => session.id === s.id)
          if (exists) {
            return { sessions: state.sessions.map(session => session.id === s.id ? s : session) }
          }
          return { sessions: [s, ...state.sessions] }
        })
      },

      toggleSession: (id) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
          ),
        }))
        
        const user = useAppStore.getState().user
        if (user) {
          // get the updated state
          const updated = useGymStore.getState().sessions.find(s => s.id === id)
          if (updated) {
            updateDoc(doc(db, 'users', user.uid, 'gym', id), { isCompleted: updated.isCompleted }).catch(console.error)
          }
        }
      },

      deleteSession: (id) => {
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }))
        const user = useAppStore.getState().user
        if (user) {
          deleteDoc(doc(db, 'users', user.uid, 'gym', id)).catch(console.error)
        }
      },

      updateSession: (id, patch) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }))
        const user = useAppStore.getState().user
        if (user) {
          updateDoc(doc(db, 'users', user.uid, 'gym', id), patch).catch(console.error)
        }
      },
    }),
    { name: 'farid-gym-store' }
  )
)
