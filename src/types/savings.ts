// src/types/savings.ts
export type AssetType = 'bitcoin' | 'seabank'

export interface SavingsEntry {
  id: string
  assetType: AssetType
  amount: number
  date: string // ISO date string YYYY-MM-DD
  createdAt: number // timestamp
  note?: string
}

export interface WeeklyGoalProgress {
  bitcoin: number
  seabank: number
  weekStart: string // ISO date of Monday
}
