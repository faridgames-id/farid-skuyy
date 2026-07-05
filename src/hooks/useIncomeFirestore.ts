// src/hooks/useIncomeFirestore.ts
// Syncs local Zustand store with Firestore for the authenticated user.
// Falls back gracefully to local-only mode when Firebase isn't configured.

import { useEffect, useRef } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/appStore'
import { useIncomeStore } from '../store/incomeStore'
import type { IncomeEntry } from '../types/income'

export function useIncomeFirestore() {
  const user = useAppStore((s) => s.user)
  const { entries, addEntry, syncEntry, deleteEntry, setSyncing } = useIncomeStore()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user || user.uid.startsWith('guest-')) return

    // Guard: if no real projectId configured, skip Firestore
    const isConfigured =
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
    if (!isConfigured) return

    setSyncing(true)
    const q = query(
      collection(db, 'users', user.uid, 'income'),
      orderBy('date', 'desc')
    )

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        // Merge remote entries into local store (simple overwrite approach)
        snap.docChanges().forEach((change) => {
          const data = change.doc.data() as Omit<IncomeEntry, 'id'>
          if (change.type === 'added' || change.type === 'modified') {
            const already = entries.find((e) => e.id === change.doc.id)
            if (!already || change.type === 'modified') {
              syncEntry({ ...data, id: change.doc.id, createdAt: data.createdAt ?? Date.now() } as IncomeEntry)
            }
          }
          if (change.type === 'removed') {
            deleteEntry(change.doc.id)
          }
        })
        setSyncing(false)
      },
      () => {
        // Firestore error (e.g. security rules) – stay in local-only mode
        setSyncing(false)
      }
    )

    return () => {
      unsubRef.current?.()
    }
  }, [user?.uid])
}

export async function addIncomeToFirestore(
  uid: string,
  entry: Omit<IncomeEntry, 'id' | 'createdAt'>
) {
  const isConfigured =
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
  if (!isConfigured) return null
  const docRef = await addDoc(collection(db, 'users', uid, 'income'), {
    ...entry,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deleteIncomeFromFirestore(uid: string, id: string) {
  const isConfigured =
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
  if (!isConfigured) return
  await deleteDoc(doc(db, 'users', uid, 'income', id))
}

export async function updateIncomeInFirestore(
  uid: string,
  id: string,
  patch: Partial<Omit<IncomeEntry, 'id' | 'createdAt'>>
) {
  const isConfigured =
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
  if (!isConfigured) return
  await updateDoc(doc(db, 'users', uid, 'income', id), patch)
}
