import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check } from 'lucide-react'

interface CustomDurationPickerProps {
  value: number | '' // duration in minutes or empty
  onChange: (val: number | '') => void
}

export default function CustomDurationPicker({ value, onChange }: CustomDurationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Parse initial
  const initialValue = typeof value === 'number' ? value : 60
  
  const [selectedHour, setSelectedHour] = useState(Math.floor(initialValue / 60))
  const [selectedMinute, setSelectedMinute] = useState(initialValue % 60)

  // Sync state if value prop changes
  useEffect(() => {
    if (typeof value === 'number') {
      setSelectedHour(Math.floor(value / 60))
      setSelectedMinute(value % 60)
    }
  }, [value])

  const handleSave = () => {
    const totalMinutes = selectedHour * 60 + selectedMinute
    // Prevent 0 duration if possible, or just allow it
    onChange(totalMinutes === 0 ? 1 : totalMinutes)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const displayValue = value ? value : ''

  return (
    <>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
          <Clock size={14} />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full text-left pl-9 pr-3 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-[13px] font-semibold transition-all shadow-sm ${
            !displayValue ? 'text-slate-400' : 'text-slate-900 dark:text-white'
          } hover:border-blue-400/50 dark:hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
        >
          {displayValue ? displayValue : '60'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-transparent"
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
                    <h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-0.5">Set Duration</h3>
                    <div className="text-3xl font-black tabular-nums tracking-tight">
                      {selectedHour}<span className="text-lg text-blue-200 font-bold mx-1">h</span> 
                      {String(selectedMinute).padStart(2, '0')}<span className="text-lg text-blue-200 font-bold ml-1">m</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Hours */}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 text-center">Hours</p>
                    <div className="h-32 overflow-y-auto pr-1 space-y-1 custom-scrollbar snap-y" style={{ scrollbarWidth: 'none' }}>
                      {Array.from({ length: 6 }, (_, i) => i).map((h) => (
                        <button
                          key={`h-${h}`}
                          type="button"
                          onClick={() => setSelectedHour(h)}
                          className={`w-full py-1.5 rounded-lg text-sm font-bold transition-all snap-center ${
                            selectedHour === h
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes */}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 text-center">Minutes</p>
                    <div className="h-32 overflow-y-auto pr-1 space-y-1 custom-scrollbar snap-y" style={{ scrollbarWidth: 'none' }}>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <button
                          key={`m-${m}`}
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
