// src/components/savings/SavingsPage.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bitcoin, PiggyBank, CheckCircle2, Plus, X, Flame, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useSavingsStore, getWeekStart } from '../../store/savingsStore'
import InvestmentTrendChart from './InvestmentTrendChart'
import type { AssetType } from '../../types/savings'

const WEEKLY_GOAL = 100_000

const ASSETS: {
  id: AssetType; label: string; icon: React.ReactNode;
  accentBg: string; accentText: string; barColor: string; gradient: string;
  cardBg: string; cardBorder: string;
}[] = [
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    icon: <Bitcoin size={24} />,
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/10',
    accentText: 'text-amber-500 dark:text-amber-400',
    barColor: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-600',
    cardBg: 'bg-amber-50 dark:bg-amber-500/5',
    cardBorder: 'border-amber-200 dark:border-amber-500/20',
  },
  {
    id: 'seabank',
    label: 'SeaBank',
    icon: <PiggyBank size={24} />,
    accentBg: 'bg-blue-500/10 dark:bg-blue-500/10',
    accentText: 'text-blue-500 dark:text-blue-400',
    barColor: 'bg-blue-500',
    gradient: 'from-blue-500 via-blue-600 to-indigo-700',
    cardBg: 'bg-blue-50 dark:bg-blue-500/5',
    cardBorder: 'border-blue-200 dark:border-blue-500/20',
  },
]

function formatRpShort(n: number) {
  return n.toLocaleString('id-ID')
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

// ── Deposit Modal ─────────────────────────────────────────────────────────────
interface DepositModalProps {
  assetType: AssetType
  onClose: () => void
}

function DepositModal({ assetType, onClose }: DepositModalProps) {
  const addEntry = useSavingsStore((s) => s.addEntry)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const asset = ASSETS.find((a) => a.id === assetType)!

  const handleSubmit = () => {
    const num = parseInt(amount.replace(/\D/g, ''), 10)
    if (!num || num <= 0) return
    setSubmitting(true)
    addEntry({
      assetType,
      amount: num,
      date: new Date().toISOString().slice(0, 10),
      note: note.trim() || undefined,
    })
    setTimeout(() => onClose(), 400)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-[320px] rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className={asset.accentText}>{asset.icon}</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              Deposit {asset.label}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Amount input */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-0.5">
              Deposit Amount (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium text-sm pointer-events-none">
                Rp
              </span>
              <input
                id={'deposit-amount-' + assetType}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setAmount(raw ? formatRp(parseInt(raw, 10)) : '')
                }}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
              />
            </div>
            {/* Quick amount buttons */}
            <div className="flex gap-2 pt-2">
              {[50000, 100000, 200000, 300000].map((n) => (
                <button
                  key={n}
                  onClick={() => setAmount(formatRp(n))}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow active:scale-95"
                >
                  {formatRpShort(n)}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-0.5">
              Note (optional)
            </label>
            <input
              id={'deposit-note-' + assetType}
              type="text"
              placeholder="e.g. Weekly DCA"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
            />
          </div>

          {/* Submit */}
          <motion.button
            id={'btn-confirm-deposit-' + assetType}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={!amount || parseInt(amount.replace(/\D/g, ''), 10) <= 0 || submitting}
            className={'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none ' + (
              submitting ? 'bg-green-500' : 'bg-gradient-to-r ' + asset.gradient + ' hover:brightness-105'
            )}
          >
            {submitting ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <CheckCircle2 size={16} /> Deposited!
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus size={16} /> Confirm Deposit
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main SavingsPage ──────────────────────────────────────────────────────────
export default function SavingsPage() {
  const [depositModal, setDepositModal] = useState<AssetType | null>(null)
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
      if (sortedWeeks.includes(w)) { count++; checkDate.setDate(checkDate.getDate() - 7) }
      else break
    }
    return count
  }, [entries])

  const [viewDate, setViewDate] = useState(new Date())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const shiftMonth = (delta: number) => {
    setViewDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + delta)
      return d
    })
  }

  const currentMonth = viewDate.toISOString().slice(0, 7)
  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const bitcoinCount = entries.filter(e => e.assetType === 'bitcoin' && e.date.startsWith(currentMonth)).length
  const seabankCount = entries.filter(e => e.assetType === 'seabank' && e.date.startsWith(currentMonth)).length

  // Month totals
  const now = new Date()
  const thisMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  const btcThisMonth = entries.filter((e) => e.assetType === 'bitcoin' && e.date.startsWith(thisMonthKey))
    .reduce((s, e) => s + e.amount, 0)
  const sbThisMonth = entries.filter((e) => e.assetType === 'seabank' && e.date.startsWith(thisMonthKey))
    .reduce((s, e) => s + e.amount, 0)
  const allTimeBtc = entries.filter((e) => e.assetType === 'bitcoin').reduce((s, e) => s + e.amount, 0)
  const allTimeSb = entries.filter((e) => e.assetType === 'seabank').reduce((s, e) => s + e.amount, 0)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5"
      >
      {/* Hero stats card - Wallet Style */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-5 shadow-xl shadow-orange-500/25 relative overflow-hidden mb-4 text-white">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header & Streak */}
          <div className="flex justify-between items-start">
             <div>
                <p className="text-orange-100 text-[9px] font-bold uppercase tracking-widest mb-0.5 drop-shadow-sm">Savings Vault</p>
                <p className="text-orange-50/80 text-[11px] font-medium mb-0.5">Total Assets</p>
                <h3 className="text-2xl font-black tracking-tight drop-shadow-sm">Rp {formatRp((allTimeBtc || 0) + (allTimeSb || 0))}</h3>
             </div>
             <div className="bg-white/20 px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md flex items-center gap-1.5 text-[10px] font-bold border border-white/10">
               <Flame size={12} className="text-amber-200" />
               {streak} Week{streak !== 1 ? 's' : ''} Streak
             </div>
          </div>
          
          {/* Asset Breakdown */}
          <div className="grid grid-cols-2 gap-2.5">
             <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5 text-orange-50">
                   <div className="bg-white/20 p-1 rounded-md"><Bitcoin size={12} /></div>
                   <span className="text-[10px] font-bold tracking-wide">Bitcoin</span>
                </div>
                <p className="text-base font-extrabold tracking-tight">Rp {formatRp(allTimeBtc || 0)}</p>
             </div>
             
             <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5 text-orange-50">
                   <div className="bg-white/20 p-1 rounded-md"><PiggyBank size={12} /></div>
                   <span className="text-[10px] font-bold tracking-wide">SeaBank</span>
                </div>
                <p className="text-base font-extrabold tracking-tight">Rp {formatRp(allTimeSb || 0)}</p>
             </div>
          </div>
          
          {/* Monthly Quest */}
          <div className="bg-black/15 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/10 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
             <p className="text-orange-50 text-[10px] font-medium leading-relaxed">
               <span className="font-bold text-amber-200">Quest:</span> Complete 4x deposits per month to build long-term wealth.
             </p>
          </div>
        </div>
      </div>

        {/* ── Monthly Quest Progress ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
          <div className="px-5 pt-5 pb-4 relative z-20">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Monthly Quest
              </h3>
              <div className="relative">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => shiftMonth(-1)} className="p-0.5 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeft size={14}/></button>
                  <button onClick={() => setShowMonthPicker(!showMonthPicker)} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {monthLabel}
                  </button>
                  <button onClick={() => shiftMonth(1)} className="p-0.5 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={14}/></button>
                </div>
                
                {/* Month Picker Popup */}
                <AnimatePresence>
                  {showMonthPicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2.5 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-700/60 w-64 z-50"
                      >
                        <div className="flex justify-between items-center mb-3.5 px-1.5">
                          <button onClick={() => shiftMonth(-12)} className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronLeft size={14}/></button>
                          <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 tracking-wide">
                            {viewDate.getFullYear()}
                          </span>
                          <button onClick={() => shiftMonth(12)} className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"><ChevronRight size={14}/></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <button
                              key={m}
                              onClick={() => {
                                setViewDate(prev => {
                                  const d = new Date(prev);
                                  d.setMonth(i);
                                  return d;
                                });
                                setShowMonthPicker(false);
                              }}
                              className={'py-2 rounded-xl text-xs font-bold transition-all duration-300 ' + (
                                viewDate.getMonth() === i
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              4x Top-ups · Bitcoin & SeaBank
            </p>
          </div>

          <div className="px-5 pb-5 space-y-6">
            {ASSETS.map((asset) => {
              const count = asset.id === 'bitcoin' ? bitcoinCount : seabankCount
              const isComplete = count >= 4

              return (
                <div key={asset.id} className="space-y-3">
                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <div className={'flex items-center gap-2 ' + asset.accentText}>
                      {asset.icon}
                      <span className="text-sm font-bold">
                        {asset.label} Monthly Goal
                      </span>
                      {isComplete && <CheckCircle2 size={16} className="text-green-500" />}
                    </div>
                    <span className={'text-sm font-extrabold font-mono tracking-tight ' + asset.accentText}>
                      {count}/{Math.max(4, count)} <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Top-ups</span>
                    </span>
                  </div>

                  {/* Progress slots — dynamic count */}
                  <div className="flex gap-2">
                    {Array.from({ length: Math.max(4, count) }, (_, i) => i + 1).map(slot => (
                      <div key={slot} className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                         {count >= slot && (
                           <motion.div
                             initial={{ width: 0 }}
                             animate={{ width: '100%' }}
                             transition={{ duration: 0.5, delay: slot * 0.1 }}
                             className={'h-full rounded-full bg-gradient-to-r ' + asset.gradient}
                           />
                         )}
                      </div>
                    ))}
                  </div>

                  {/* Deposit button */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {!isComplete ? (4 - count) + ' remaining this month' : 'Goal achieved! 🎉 (' + count + ' total)'}
                    </span>
                    <motion.button
                      id={'btn-deposit-' + asset.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDepositModal(asset.id)}
                      className={'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-r ' + asset.gradient}
                    >
                      <Plus size={13} />
                      Deposit
                    </motion.button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Investment Trend Chart ── */}
        <InvestmentTrendChart currentMonth={currentMonth} />

        {/* ── Recent Savings Entries ── */}
        {entries.some(e => e.date.startsWith(currentMonth)) && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
            <div className="px-5 pt-4 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recent Deposits
              </h3>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700/60" />
            <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {[...entries]
                .filter(e => e.date.startsWith(currentMonth))
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 12)
                .map((entry) => {
                  const asset = ASSETS.find((a) => a.id === entry.assetType)!
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {asset.icon}
                        </div>
                        <div>
                          <p className={'text-xs font-bold ' + asset.accentText}>
                            {asset.label}
                          </p>
                          {entry.note && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          + Rp {formatRpShort(entry.amount)}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {entry.date}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium pb-2">
          v1.2 | Farid Tracker
        </p>
      </motion.div>

      {/* Deposit modal */}
      <AnimatePresence>
        {depositModal && (
          <DepositModal
            key={depositModal}
            assetType={depositModal}
            onClose={() => setDepositModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
