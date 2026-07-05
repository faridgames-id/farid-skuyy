// src/components/income/IncomeCard.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ChevronDown, Pencil, Check, X, DollarSign } from 'lucide-react'
import type { IncomeEntry } from '../../types/income'
import { useIncomeStore } from '../../store/incomeStore'

const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Freelance:     { bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-600 dark:text-purple-400',  dot: 'bg-purple-500' },
  Salary:        { bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-600 dark:text-blue-400',      dot: 'bg-blue-500' },
  'Side Project':{ bg: 'bg-teal-50 dark:bg-teal-900/20',     text: 'text-teal-600 dark:text-teal-400',      dot: 'bg-teal-500' },
  Investment:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20',text: 'text-emerald-600 dark:text-emerald-400',dot: 'bg-emerald-500' },
  Gift:          { bg: 'bg-pink-50 dark:bg-pink-900/20',      text: 'text-pink-600 dark:text-pink-400',      dot: 'bg-pink-500' },
}

function getSourceStyle(source: string) {
  return SOURCE_COLORS[source] ?? {
    bg: 'bg-slate-100 dark:bg-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  }
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(n)
    .replace('IDR', 'Rp')
}

function formatRpDisplay(raw: string) {
  const num = raw.replace(/\D/g, '')
  if (!num) return ''
  return new Intl.NumberFormat('id-ID').format(Number(num))
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const SOURCE_PRESETS = ['Freelance', 'Salary', 'Side Project', 'Investment', 'Gift', 'Other']

interface Props {
  entry: IncomeEntry
  index: number
}

export default function IncomeCard({ entry, index }: Props) {
  const { deleteEntry, updateEntry } = useIncomeStore()

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [editType, setEditType] = useState(entry.type || 'income')
  const [editAmount, setEditAmount] = useState(
    new Intl.NumberFormat('id-ID').format(entry.amount)
  )
  const [editSource, setEditSource] = useState(entry.source)
  const [editNote, setEditNote] = useState(entry.note ?? '')

  const style = getSourceStyle(entry.source)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setEditAmount(raw ? formatRpDisplay(raw) : '')
  }

  function openEdit() {
    setEditType(entry.type || 'income')
    setEditAmount(new Intl.NumberFormat('id-ID').format(entry.amount))
    setEditSource(entry.source)
    setEditNote(entry.note ?? '')
    setEditing(true)
    setExpanded(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function handleSave() {
    const amountNum = Number(editAmount.replace(/\D/g, ''))
    if (!amountNum || !editSource.trim()) return

    setSaving(true)
    const patch = {
      type: editType,
      amount: amountNum,
      source: editSource.trim(),
      note: editNote.trim(),
    }
    updateEntry(entry.id, patch)
    setSaving(false)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    deleteEntry(entry.id)
  }

  const cardStyle = entry.type === 'income' 
    ? { bg: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shadow-emerald-500/20', text: 'text-white', amt: 'text-emerald-500 dark:text-emerald-400' }
    : { bg: 'bg-gradient-to-br from-rose-400 to-red-600 shadow-md shadow-rose-500/20', text: 'text-white', amt: 'text-slate-700 dark:text-slate-300' }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all duration-300 overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3.5">
          {/* Source Icon/Badge */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cardStyle.bg} ${cardStyle.text} flex-shrink-0`}>
            <DollarSign size={20} strokeWidth={2.5} />
          </div>

          {/* Details */}
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white mb-0.5">{entry.source}</p>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{formatDate(entry.date)}</p>
          </div>
        </div>

        {/* Amount & Arrow */}
        <div className="flex items-center gap-3">
          <p className={`text-base font-black tracking-tight ${entry.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
            {entry.type === 'expense' ? '-' : '+'}{formatRp(entry.amount)}
          </p>
          
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-300 dark:text-slate-600"
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3 space-y-3">
              {/* Edit mode */}
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-3"
                  >
                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setEditType('income')}
                        className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${editType === 'income' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType('expense')}
                        className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${editType === 'expense' ? 'bg-white dark:bg-slate-600 shadow-sm text-red-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Expense
                      </button>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount (Rp)</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <DollarSign size={12} className="text-emerald-500" />
                        </div>
                        <input
                          id={`edit-amount-${entry.id}`}
                          type="text"
                          inputMode="numeric"
                          value={editAmount}
                          onChange={handleAmountChange}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source</label>
                      <input
                        id={`edit-source-${entry.id}`}
                        type="text"
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {SOURCE_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditSource(p)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              editSource === p
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Note <span className="font-normal normal-case">(optional)</span></label>
                      <textarea
                        id={`edit-note-${entry.id}`}
                        rows={2}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Brief description…"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-2">
                      <motion.button
                        id={`btn-save-edit-income-${entry.id}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm py-2 rounded-xl shadow-sm disabled:opacity-60 transition-all"
                      >
                        <Check size={13} />
                        {saving ? 'Saving…' : 'Save'}
                      </motion.button>
                      <button
                        id={`btn-cancel-edit-income-${entry.id}`}
                        onClick={cancelEdit}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {/* Note */}
                    {entry.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2">
                        "{entry.note}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-edit-income-expand-${entry.id}`}
                        onClick={openEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>

                      <button
                        id={`btn-delete-income-${entry.id}`}
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          confirmDelete
                            ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                            : 'text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        }`}
                      >
                        <Trash2 size={11} />
                        {confirmDelete ? 'Confirm?' : 'Delete'}
                      </button>

                      {confirmDelete && (
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
