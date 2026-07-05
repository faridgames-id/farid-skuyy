// src/types/gym.ts
export type WorkoutType =
  | 'Push'
  | 'Pull'
  | 'Legs'
  | 'Cardio'
  | 'Upper Body'
  | 'Full Body'
  | 'Rest Day'
  | 'Custom'

export interface GymSession {
  id: string
  date: string         // YYYY-MM-DD
  type: WorkoutType
  customName?: string  // For 'Custom' workout type
  customEmoji?: string // For 'Custom' workout type icon
  notes?: string
  isCompleted: boolean
  durationMin?: number // optional minutes
  createdAt: number
}
