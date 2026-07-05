// src/store/incomeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from './appStore'
import type { IncomeEntry } from '../types/income'

interface IncomeState {
  entries: IncomeEntry[]
  setEntries: (entries: IncomeEntry[]) => void
  addEntry: (entry: Omit<IncomeEntry, 'id' | 'createdAt'>) => string
  syncEntry: (entry: IncomeEntry) => void
  updateEntry: (id: string, patch: Partial<Omit<IncomeEntry, 'id' | 'createdAt'>>) => void
  deleteEntry: (id: string) => void
  // Firestore sync flag per entry
  syncing: boolean
  setSyncing: (v: boolean) => void

  customSources: string[]
  addCustomSource: (source: string) => void
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set) => ({
      entries: [],
      setEntries: (entries) => set({ entries }),
      syncing: false,
      setSyncing: (v) => set({ syncing: v }),
      customSources: [],
      addCustomSource: (source) => set((state) => {
        if (state.customSources.includes(source)) return state
        return { customSources: [...state.customSources, source] }
      }),

      addEntry: (entry) => {
        const id = generateId()
        const newEntry = { ...entry, id, createdAt: Date.now() }
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }))

        // Sync to Firestore
        const user = useAppStore.getState().user
        if (user) {
          setDoc(doc(db, 'users', user.uid, 'income', id), newEntry).catch(console.error)
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
          updateDoc(doc(db, 'users', user.uid, 'income', id), patch).catch(console.error)
        }
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }))

        // Sync to Firestore
        const user = useAppStore.getState().user
        if (user) {
          deleteDoc(doc(db, 'users', user.uid, 'income', id)).catch(console.error)
        }
      },
    }),
    { name: 'farid-income-store' }
  )
)
