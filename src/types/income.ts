// src/types/income.ts
export interface IncomeEntry {
  id: string
  amount: number
  source: string
  date: string // ISO date string YYYY-MM-DD
  note?: string
  createdAt: number // timestamp
  type?: 'income' | 'expense' // Add type field
}

export type IncomePeriod = 'all' | 'thisMonth' | 'lastMonth'
