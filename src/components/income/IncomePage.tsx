// src/components/income/IncomePage.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, Inbox } from 'lucide-react'
import { useIncomeStore } from '../../store/incomeStore'
import { useIncomeFirestore } from '../../hooks/useIncomeFirestore'
import IncomeSummary from './IncomeSummary'
import IncomeForm from './IncomeForm'
import IncomeCard from './IncomeCard'

export default function IncomePage() {
  // Wire Firestore sync (no-ops when unconfigured)
  useIncomeFirestore()

  const entries = useIncomeStore((s) => s.entries)

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMonth, setViewMonth] = useState(() => new Date())

  const viewMonthKey = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}`

  const filtered = useMemo(() => {
    // Sort chronologically (date 1 -> end of month)
    let list = [...entries].sort((a, b) => a.date.localeCompare(b.date))

    // Filter to currently selected view month
    list = list.filter((e) => e.date.startsWith(viewMonthKey))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.source.toLowerCase().includes(q) ||
          (e.note ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, viewMonthKey, search])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    })
      .format(n)
      .replace('IDR', 'Rp')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Summary chart card */}
      <IncomeSummary viewMonth={viewMonth} setViewMonth={setViewMonth} />

      {/* Add form (toggle) */}
      <AnimatePresence>
        {showForm && (
          <IncomeForm onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* Section header + add button */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            History
          </h3>
          {filtered.length > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {filtered.length} entries · {formatRp(totalFiltered)}
            </p>
          )}
        </div>
        {!showForm && (
          <motion.button
            id="btn-add-income-form"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
          >
            <Plus size={15} />
            Add
          </motion.button>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="income-search"
            type="text"
            placeholder="Search by source or note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Inbox size={28} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No entries yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {search ? 'Try a different search term.' : 'Tap "Add" to record your first income.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="space-y-2"
          >
            {filtered.map((entry, i) => (
              <IncomeCard key={entry.id} entry={entry} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
