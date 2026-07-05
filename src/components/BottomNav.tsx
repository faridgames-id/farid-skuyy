import { motion } from 'framer-motion'
import { LayoutDashboard, DollarSign, CalendarDays, Dumbbell, UserCircle, PiggyBank } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const navItems = [
  { id: 'income',    label: 'Income',    icon: DollarSign },
  { id: 'schedule',  label: 'Tasks',     icon: CalendarDays },
  { id: 'dashboard', label: 'Home',      icon: LayoutDashboard },
  { id: 'gym',       label: 'Gym',       icon: Dumbbell },
  { id: 'savings',   label: 'Vault',     icon: PiggyBank },
] as const

export default function BottomNav() {
  const { activePage, setActivePage } = useAppStore()

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0A101E]/90 backdrop-blur-xl border-t border-slate-200 dark:border-[#1E293B]"
      style={{
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-stretch justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 group"
            >
              {/* Active top bar */}
              {isActive && (
                <motion.div
                  layoutId="nav-top-bar"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[9px] font-bold leading-none transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      {/* Safe area fill */}
      <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  )
}
