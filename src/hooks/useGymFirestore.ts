// src/hooks/useGymFirestore.ts
// Syncs local Zustand gym store with Firestore for the authenticated user.
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
import { useGymStore } from '../store/gymStore'
import type { GymSession } from '../types/gym'

function isFirebaseConfigured() {
  return (
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
  )
}

export function useGymFirestore() {
  const user = useAppStore((s) => s.user)
  const { sessions, addSession, syncSession, deleteSession } = useGymStore()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user || user.uid.startsWith('guest-') || !isFirebaseConfigured()) return

    const q = query(
      collection(db, 'users', user.uid, 'gym'),
      orderBy('date', 'desc')
    )

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        snap.docChanges().forEach((change) => {
          const data = change.doc.data() as Omit<GymSession, 'id'>
          if (change.type === 'added' || change.type === 'modified') {
            const already = sessions.find((s) => s.id === change.doc.id)
            if (!already || change.type === 'modified') {
              syncSession({ ...data, id: change.doc.id, createdAt: data.createdAt ?? Date.now() } as GymSession)
            }
          }
          if (change.type === 'removed') {
            deleteSession(change.doc.id)
          }
        })
      },
      () => { /* Firestore error – stay local-only */ }
    )

    return () => { unsubRef.current?.() }
  }, [user?.uid])
}

export async function addGymToFirestore(
  uid: string,
  session: Omit<GymSession, 'id' | 'createdAt'>
) {
  if (!isFirebaseConfigured()) return null
  const docRef = await addDoc(collection(db, 'users', uid, 'gym'), {
    ...session,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateGymInFirestore(
  uid: string,
  id: string,
  patch: Partial<Omit<GymSession, 'id' | 'createdAt'>>
) {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(db, 'users', uid, 'gym', id), patch)
}

export async function deleteGymFromFirestore(uid: string, id: string) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'users', uid, 'gym', id))
}
