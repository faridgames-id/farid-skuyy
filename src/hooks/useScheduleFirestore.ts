// src/hooks/useScheduleFirestore.ts
// Syncs local Zustand schedule store with Firestore for the authenticated user.
// Gracefully no-ops when Firebase is not configured.

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
import { useScheduleStore } from '../store/scheduleStore'
import type { ScheduleTask } from '../types/schedule'

function isFirebaseConfigured() {
  return (
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
  )
}

export function useScheduleFirestore() {
  const user = useAppStore((s) => s.user)
  const { tasks, addTask, syncTask, deleteTask } = useScheduleStore()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user || user.uid.startsWith('guest-') || !isFirebaseConfigured()) return

    const q = query(
      collection(db, 'users', user.uid, 'schedule'),
      orderBy('date', 'desc')
    )

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        snap.docChanges().forEach((change) => {
          const data = change.doc.data() as Omit<ScheduleTask, 'id'>
          if (change.type === 'added' || change.type === 'modified') {
            const already = tasks.find((t) => t.id === change.doc.id)
            if (!already || change.type === 'modified') {
              syncTask({ ...data, id: change.doc.id } as ScheduleTask)
            }
          }
          if (change.type === 'removed') {
            deleteTask(change.doc.id)
          }
        })
      },
      () => { /* Firestore error – stay local-only */ }
    )

    return () => { unsubRef.current?.() }
  }, [user?.uid])
}

export async function addScheduleToFirestore(
  uid: string,
  task: Omit<ScheduleTask, 'id' | 'createdAt'>
) {
  if (!isFirebaseConfigured()) return null
  const docRef = await addDoc(collection(db, 'users', uid, 'schedule'), {
    ...task,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateScheduleInFirestore(
  uid: string,
  id: string,
  patch: Partial<Pick<ScheduleTask, 'task' | 'period' | 'time' | 'isCompleted'>>
) {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(db, 'users', uid, 'schedule', id), patch)
}

export async function deleteScheduleFromFirestore(uid: string, id: string) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'users', uid, 'schedule', id))
}
