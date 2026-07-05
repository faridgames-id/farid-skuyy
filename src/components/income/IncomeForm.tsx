// src/components/income/IncomeForm.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Tag, CalendarDays, StickyNote, X, CheckCircle2, Plus } from 'lucide-react'
import { useIncomeStore } from '../../store/incomeStore'
import { useAppStore } from '../../store/appStore'
import CalendarPicker from '../schedule/CalendarPicker'

const SOURCE_PRESETS = ['Freelance', 'Salary', 'Side Project', 'Investment', 'Gift', 'Other']

interface Props {
  onClose: () => void
}

function formatRp(raw: string) {
  const num = raw.replace(/\D/g, '')
  if (!num) return ''
  return new Intl.NumberFormat('id-ID').format(Number(num))
}

export default function IncomeForm({ onClose }: Props) {
  const addEntry = useIncomeStore((s) => s.addEntry)
  const customSources = useIncomeStore((s) => s.customSources || [])
  const addCustomSource = useIncomeStore((s) => s.addCustomSource)

  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [note, setNote] = useState('')
  
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [newSourceVal, setNewSourceVal] = useState('')

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const amountNum = Number(amount.replace(/\D/g, ''))

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setAmount(raw ? formatRp(raw) : '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!amountNum || amountNum <= 0) return setError('Please enter a valid amount.')
    if (!source.trim()) return setError('Please enter an income source.')
    if (!date) return setError('Please pick a date.')

    setSaving(true)
    try {
      const entry: any = {
        amount: amountNum,
        source: source.trim(),
        date,
        note: note.trim(),
        type,
      }
      
      addEntry(entry)
      setSuccess(true)
      setAmount('')
      setSource('')
      setNote('')
      setIsAddingSource(false)
      setNewSourceVal('')

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 900)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleAddCustomSource() {
    const trimmed = newSourceVal.trim()
    if (trimmed) {
      addCustomSource(trimmed)
      setSource(trimmed)
    }
    setIsAddingSource(false)
    setNewSourceVal('')
  }

  const allPresets = [...SOURCE_PRESETS, ...customSources]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-800/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Add Transaction</h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Record income or expense</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Type Toggle */}
        <div className="relative flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`relative flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 z-10 ${type === 'income' ? 'text-white drop-shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {type === 'income' && (
              <motion.div
                layoutId="type-indicator"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`relative flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 z-10 ${type === 'expense' ? 'text-white drop-shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {type === 'expense' && (
              <motion.div
                layoutId="type-indicator"
                className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-500 rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            Expense
          </button>
        </div>

        {/* Amount */}
        <div className="group">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Amount (Rp)
          </label>
          <div className="relative">
            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors pointer-events-none ${type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-500'}`}>
              <DollarSign size={14} strokeWidth={2.5} />
            </div>
            <input
              id="income-amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className={`w-full pl-11 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white font-semibold text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${type === 'income' ? 'focus:ring-emerald-500/50 hover:border-emerald-300' : 'focus:ring-rose-500/50 hover:border-rose-300'}`}
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Source
          </label>
          <div className="relative">
            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors pointer-events-none ${type === 'income' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-500' : 'bg-orange-50 dark:bg-orange-500/20 text-orange-500'}`}>
              <Tag size={14} strokeWidth={2.5} />
            </div>
            <input
              id="income-source"
              type="text"
              placeholder="e.g. Salary, Rent…"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={`w-full pl-11 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${type === 'income' ? 'focus:ring-blue-500/50 hover:border-blue-300' : 'focus:ring-orange-500/50 hover:border-orange-300'}`}
            />
          </div>
          {/* Preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {allPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSource(p)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                  source === p
                    ? type === 'income'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm scale-105'
                      : 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
            
            {/* Add Custom Source Chip */}
            <AnimatePresence mode="wait">
              {isAddingSource ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center overflow-hidden"
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="New preset"
                    value={newSourceVal}
                    onChange={(e) => setNewSourceVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomSource()
                      }
                      if (e.key === 'Escape') {
                        setIsAddingSource(false)
                        setNewSourceVal('')
                      }
                    }}
                    onBlur={handleAddCustomSource}
                    className="w-20 px-2 py-1 rounded-l-lg bg-slate-100 dark:bg-slate-800 border-none text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAddCustomSource}
                    className="px-2 py-1 rounded-r-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={() => setIsAddingSource(true)}
                  className="px-2 py-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[10px] font-bold transition-all duration-200 flex items-center gap-1"
                >
                  <Plus size={10} strokeWidth={3} />
                  New
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Date
          </label>
          <div className="relative">
            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors pointer-events-none ${type === 'income' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500' : 'bg-purple-50 dark:bg-purple-500/20 text-purple-500'}`}>
              <CalendarDays size={14} strokeWidth={2.5} />
            </div>
            <button
              id="income-date-btn"
              type="button"
              onClick={() => setShowDatePicker(true)}
              className={`w-full text-left pl-11 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${type === 'income' ? 'focus:ring-indigo-500/50 hover:border-indigo-300' : 'focus:ring-purple-500/50 hover:border-purple-300'}`}
            >
              {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </button>
          </div>
        </div>

        {/* Note (optional) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Note <span className="text-slate-300 dark:text-slate-600 font-normal normal-case">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-2.5 top-2.5 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center pointer-events-none">
              <StickyNote size={14} strokeWidth={2.5} className="text-slate-400" />
            </div>
            <textarea
              id="income-note"
              rows={2}
              placeholder="Brief description…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-11 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="btn-save-income"
          type="submit"
          disabled={saving || success}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className={`w-full mt-2 flex items-center justify-center gap-2 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 active:scale-[0.98] disabled:opacity-70 ${type === 'income' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25' : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 shadow-rose-500/25'}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Saved!
              </motion.span>
            ) : saving ? (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Saving…
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Save {type === 'income' ? 'Income' : 'Expense'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <CalendarPicker
            selectedDate={date}
            onSelect={setDate}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

