// src/store/savingsStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from './appStore'
import type { SavingsEntry, AssetType } from '../types/savings'
import { getLocalISOString, getLocalISOMonth } from '../utils/date'

interface SavingsState {
  entries: SavingsEntry[]
  setEntries: (entries: SavingsEntry[]) => void
  addEntry: (entry: Omit<SavingsEntry, 'id' | 'createdAt'>) => string
  syncEntry: (entry: SavingsEntry) => void
  updateEntry: (id: string, patch: Partial<Omit<SavingsEntry, 'id' | 'createdAt'>>) => void
  deleteEntry: (id: string) => void
  // Weekly progress getter (computed)
  getWeeklyProgress: (weekStart: string) => { bitcoin: number; seabank: number }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Get Monday of the current week
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return getLocalISOString(d)
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      entries: [],
      setEntries: (entries) => set({ entries }),

      addEntry: (entry) => {
        const id = generateId()
        const newEntry = { ...entry, id, createdAt: Date.now() }
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }))
        
        // Sync to Firestore
        const user = useAppStore.getState().user
        if (user) {
          setDoc(doc(db, 'users', user.uid, 'savings', id), newEntry).catch(console.error)
        }
        
        return id
      },

      syncEntry: (entry) => {
        set((state) => {
          const exists = state.entries.some(e => e.id === entry.id)
          if (exists) {
            return { entries: state.entries.map(e => e.id === entry.id ? entry : e) }
          }
          return { entries: [entry, ...state.entries] }
        })
      },

      updateEntry: (id, patch) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        }))
        
        // Sync to Firestore
        const user = useAppStore.getState().user
        if (user) {
          updateDoc(doc(db, 'users', user.uid, 'savings', id), patch).catch(console.error)
        }
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }))
        
        // Sync to Firestore
        const user = useAppStore.getState().user
        if (user) {
          deleteDoc(doc(db, 'users', user.uid, 'savings', id)).catch(console.error)
        }
      },

      getWeeklyProgress: (weekStart) => {
        const { entries } = get()
        const weekEnd = new Date(weekStart + 'T00:00:00')
        weekEnd.setDate(weekEnd.getDate() + 6)
        const weekEndISO = getLocalISOString(weekEnd)

        const weekEntries = entries.filter(
          (e) => e.date >= weekStart && e.date <= weekEndISO
        )

        return {
          bitcoin: weekEntries
            .filter((e) => e.assetType === 'bitcoin')
            .reduce((sum, e) => sum + e.amount, 0),
          seabank: weekEntries
            .filter((e) => e.assetType === 'seabank')
            .reduce((sum, e) => sum + e.amount, 0),
        }
      },
    }),
    { name: 'farid-savings-store' }
  )
)
