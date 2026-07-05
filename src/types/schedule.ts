// src/types/schedule.ts
export type Period = 'Morning' | 'Afternoon' | 'Night'

export interface ScheduleTask {
  id: string
  task: string
  period: Period
  date: string        // YYYY-MM-DD (creation date)
  time?: string       // HH:MM (optional)
  isCompleted?: boolean // Legacy
  completedDates?: string[] // Array of YYYY-MM-DD dates where this task was completed
  createdAt: number
}
