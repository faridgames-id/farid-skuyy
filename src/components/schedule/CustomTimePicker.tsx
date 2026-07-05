import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlarmClock, Check } from 'lucide-react'

interface CustomTimePickerProps {
  value: string
  onChange: (val: string) => void
}

export default function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Parse initial
  const initialHour = value ? parseInt(value.split(':')[0], 10) : 9
  const initialMinute = value ? parseInt(value.split(':')[1], 10) : 0
  
  const [selectedHour, setSelectedHour] = useState(initialHour % 12 || 12)
  const [selectedMinute, setSelectedMinute] = useState(Math.round(initialMinute / 5) * 5 === 60 ? 0 : Math.round(initialMinute / 5) * 5)
  const [isPM, setIsPM] = useState(initialHour >= 12)

  // Sync state if value prop changes
  useEffect(() => {
    if (value) {
      const h = parseInt(value.split(':')[0], 10)
      const m = parseInt(value.split(':')[1], 10)
      setSelectedHour(h % 12 || 12)
      setSelectedMinute(Math.round(m / 5) * 5 === 60 ? 0 : Math.round(m / 5) * 5)
      setIsPM(h >= 12)
    }
  }, [value])

  const handleSave = () => {
    let finalHour = selectedHour
    if (isPM && finalHour < 12) finalHour += 12
    if (!isPM && finalHour === 12) finalHour = 0
    
    const hh = String(finalHour).padStart(2, '0')
    const mm = String(selectedMinute).padStart(2, '0')
    onChange(`${hh}:${mm}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const displayValue = value ? value : '--:--'

  return (
    <>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center pointer-events-none">
          <AlarmClock size={11} className="text-indigo-500" />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full text-left pl-11 pr-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {displayValue}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="relative w-full max-w-[280px] bg-white dark:bg-[#0B1120] rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-5 py-4 text-white relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-0.5">Set Time</h3>
                    <div className="text-3xl font-black tabular-nums tracking-tight">
                      {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} <span className="text-lg text-blue-200">{isPM ? 'PM' : 'AM'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Hours */}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 text-center">Hour</p>
                    <div className="h-32 overflow-y-auto pr-1 space-y-1 custom-scrollbar snap-y" style={{ scrollbarWidth: 'none' }}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHour(h)}
                          className={`w-full py-1.5 rounded-lg text-sm font-bold transition-all snap-center ${
                            selectedHour === h
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {String(h).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes */}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 text-center">Minute</p>
                    <div className="h-32 overflow-y-auto pr-1 space-y-1 custom-scrollbar snap-y" style={{ scrollbarWidth: 'none' }}>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMinute(m)}
                          className={`w-full py-1.5 rounded-lg text-sm font-bold transition-all snap-center ${
                            selectedMinute === m
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {String(m).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-5 border border-slate-200 dark:border-slate-700/50 relative">
                  <button
                    type="button"
                    onClick={() => setIsPM(false)}
                    className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      !isPM ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {!isPM && (
                      <motion.div
                        layoutId="ampm-toggle"
                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">AM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPM(true)}
                    className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isPM ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {isPM && (
                      <motion.div
                        layoutId="ampm-toggle"
                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">PM</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
