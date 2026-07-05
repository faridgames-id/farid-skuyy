// src/components/savings/WeeklySavingsWidget.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, TrendingUp, CheckCircle2, Bitcoin, PiggyBank, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSavingsStore, getWeekStart } from '../../store/savingsStore'
import type { AssetType } from '../../types/savings'

const WEEKLY_GOAL = 100_000

const ASSETS: { id: AssetType; label: string; icon: React.ReactNode; accentBg: string; accentText: string; barColor: string; gradient: string }[] = [
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    icon: <Bitcoin size={18} />,
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/10',
    accentText: 'text-amber-500 dark:text-amber-400',
    barColor: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'seabank',
    label: 'SeaBank',
    icon: <PiggyBank size={18} />,
    accentBg: 'bg-blue-500/10 dark:bg-blue-500/10',
    accentText: 'text-blue-500 dark:text-blue-400',
    barColor: 'bg-blue-500',
    gradient: 'from-blue-500 via-blue-600 to-indigo-700',
  },
]

function formatRpShort(n: number) {
  return n.toLocaleString('id-ID')
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

// ── Add Savings Inline Form ───────────────────────────────────────────────────
interface AddSavingsFormProps {
  onClose: () => void
}

function AddSavingsForm({ onClose }: AddSavingsFormProps) {
  const addEntry = useSavingsStore((s) => s.addEntry)
  const [amount, setAmount] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('bitcoin')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    const num = parseInt(amount.replace(/\D/g, ''), 10)
    if (!num || num <= 0) return
    setSubmitting(true)
    addEntry({ assetType, amount: num, date, note: note.trim() || undefined })
    setTimeout(() => {
      onClose()
    }, 400)
  }

  const selectedAsset = ASSETS.find((a) => a.id === assetType)!

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Savings</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Asset type selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Asset</label>
          <div className="grid grid-cols-2 gap-2">
            {ASSETS.map((asset) => (
              <button
                key={asset.id}
                id={'savings-asset-' + asset.id}
                onClick={() => setAssetType(asset.id)}
                className={'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ' + (
                  assetType === asset.id
                    ? asset.accentBg + ' ' + asset.accentText + ' border-2 border-current'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-2 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {asset.icon}
                {asset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (Rp)</label>
          <input
            id="savings-amount"
            type="text"
            inputMode="numeric"
            placeholder="100,000"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '')
              setAmount(raw ? formatRp(parseInt(raw, 10)) : '')
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
          <input
            id="savings-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Note</label>
          <input
            id="savings-note"
            type="text"
            placeholder="Optional note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submit */}
        <motion.button
          id="btn-save-savings"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          disabled={!amount || parseInt(amount.replace(/\D/g, ''), 10) <= 0 || submitting}
          className={'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 ' + (
            submitting ? 'bg-green-500' : 'bg-gradient-to-r ' + selectedAsset.gradient + ' hover:brightness-110'
          )}
        >
          {submitting ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Saved!
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus size={16} /> Add Savings
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Monthly Tracker Component ──────────────────────────────────────────────────────
interface MonthlyTrackerProps {
  label: string
  icon: React.ReactNode
  count: number
  accentText: string
  gradient: string
}

function MonthlyTracker({ label, icon, count, accentText, gradient }: MonthlyTrackerProps) {
  const isComplete = count >= 4

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className={'flex items-center gap-1.5 ' + accentText}>
          <span className="flex-shrink-0">{icon}</span>
          <span className="text-xs font-bold">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={'text-xs font-extrabold font-mono tracking-tight ' + accentText}>
            {count}/4
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Top-ups
          </span>
          {isComplete && <CheckCircle2 size={13} className="text-green-500" />}
        </div>
      </div>

      {/* Progress slots */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map(slot => (
          <div key={slot} className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
             {count >= slot && (
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 0.5, delay: slot * 0.1 }}
                 className={'h-full rounded-full bg-gradient-to-r ' + gradient}
               />
             )}
          </div>
        ))}
      </div>

      {!isComplete && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {4 - count} remaining this month
        </p>
      )}
      {isComplete && (
        <p className="text-[10px] text-green-500 font-semibold">
          Monthly goal achieved! 🎉
        </p>
      )}
    </div>
  )
}

// ── Weekly Streak Badge ───────────────────────────────────────────────────────
function WeeklyStreakBadge() {
  const entries = useSavingsStore((s) => s.entries)

  const streak = useMemo(() => {
    if (!entries.length) return 0
    const weeksSet = new Set<string>()
    entries.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00')
      weeksSet.add(getWeekStart(d))
    })
    const sortedWeeks = [...weeksSet].sort((a, b) => b.localeCompare(a))
    const thisWeek = getWeekStart()

    if (!sortedWeeks.includes(thisWeek)) return 0

    let count = 1
    let checkDate = new Date(thisWeek + 'T00:00:00')
    checkDate.setDate(checkDate.getDate() - 7)

    for (let i = 0; i < 52; i++) {
      const w = getWeekStart(checkDate)
      if (sortedWeeks.includes(w)) {
        count++
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }
    return count
  }, [entries])

  if (streak === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-full px-3 py-1"
      title={streak + ' week' + (streak > 1 ? 's' : '') + ' investment streak!'}
    >
      <TrendingUp size={12} className="text-amber-500" />
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {streak} Week{streak > 1 ? 's' : ''} Streak
      </span>
    </motion.div>
  )
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function WeeklySavingsWidget() {
  const [showForm, setShowForm] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const entries = useSavingsStore((s) => s.entries)
  
  const currentMonth = viewDate.toISOString().slice(0, 7)
  const bitcoinCount = entries.filter(e => e.assetType === 'bitcoin' && e.date.startsWith(currentMonth)).length
  const seabankCount = entries.filter(e => e.assetType === 'seabank' && e.date.startsWith(currentMonth)).length

  const shiftMonth = (delta: number) => {
    setViewDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + delta)
      return d
    })
  }

  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Quest</h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button onClick={() => shiftMonth(-1)} className="p-0.5 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeft size={14}/></button>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-1">{monthLabel}</span>
              <button onClick={() => shiftMonth(1)} className="p-0.5 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={14}/></button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            4x Top-ups · Bitcoin & SeaBank
          </p>
        </div>
        <WeeklyStreakBadge />
      </div>

      {/* Tracker bars */}
      <div className="px-4 pb-3 space-y-4">
        <MonthlyTracker
          label="Bitcoin"
          icon={<Bitcoin size={16} />}
          count={bitcoinCount}
          accentText={ASSETS[0].accentText}
          gradient={ASSETS[0].gradient}
        />
        <MonthlyTracker
          label="SeaBank"
          icon={<PiggyBank size={16} />}
          count={seabankCount}
          accentText={ASSETS[1].accentText}
          gradient={ASSETS[1].gradient}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700/60" />

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <div className="px-4 pt-3 pb-4">
            <AddSavingsForm onClose={() => setShowForm(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Add button */}
      {!showForm && (
        <div className="px-4 py-3">
          <motion.button
            id="btn-add-savings"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
          >
            <Plus size={15} />
            Add Savings
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
