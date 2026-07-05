import { useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/appStore'
import { useSavingsStore } from '../store/savingsStore'
import type { SavingsEntry } from '../types/savings'

export function useSavingsFirestore() {
  const user = useAppStore((s) => s.user)
  const { entries, syncEntry } = useSavingsStore()

  useEffect(() => {
    if (!user || user.uid.startsWith('guest-')) return

    const isConfigured =
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
    if (!isConfigured) return

    const q = query(
      collection(db, 'users', user.uid, 'savings'),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        snap.docChanges().forEach((change) => {
          const data = change.doc.data()
          if (change.type === 'added' || change.type === 'modified') {
            const already = entries.find((e) => e.id === change.doc.id)
            if (!already || change.type === 'modified') {
              syncEntry({ ...data, id: change.doc.id, createdAt: data.createdAt ?? Date.now() } as SavingsEntry)
            }
          }
        })
      },
      (error) => {
        console.error("Firestore sync error (savings):", error)
      }
    )

    return () => unsub()
  }, [user?.uid, entries, syncEntry])
}
