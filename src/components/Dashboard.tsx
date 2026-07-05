import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, CalendarCheck, Flame, ArrowUpRight } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
}

const stats = [
  {
    id: 'income',
    label: 'Monthly Income',
    value: 'Rp 12.5M',
    change: '+18%',
    positive: true,
    icon: DollarSign,
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'schedule',
    label: 'Task Completion',
    value: '74%',
    change: '+5%',
    positive: true,
    icon: CalendarCheck,
    gradient: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'gym',
    label: 'Gym Sessions',
    value: '18 days',
    change: '3 streak',
    positive: true,
    icon: Flame,
    gradient: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
]

function StatCard({
  stat,
  index,
  onClick,
}: {
  stat: (typeof stats)[number]
  index: number
  onClick: () => void
}) {
  const Icon = stat.icon
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
          <Icon size={18} className={stat.iconColor} />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
          <ArrowUpRight size={12} />
          {stat.change}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">
        {stat.value}
      </p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
      {/* Bottom accent bar */}
      <div className={`mt-3 h-0.5 rounded-full bg-gradient-to-r ${stat.gradient} opacity-60`} />
    </motion.div>
  )
}

function QuickActionButton({
  label,
  icon: Icon,
  onClick,
  id,
}: {
  label: string
  icon: any
  onClick: () => void
  id: string
}) {
  return (
    <motion.button
      id={id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 active:scale-95 text-sm"
    >
      <Icon size={16} />
      {label}
    </motion.button>
  )
}

export default function Dashboard() {
  const { user, setActivePage } = useAppStore()
  const displayName = user?.displayName ?? 'User'
  const firstName = displayName.split(' ')[0]
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-500/25 relative overflow-hidden">
        {/* Subtle inner pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-medium mb-1">{today}</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Hello, {firstName}! 👋
          </h2>
          <p className="text-blue-100/80 text-sm">
            Ready to crush your goals today?
          </p>

          {/* Progress summary */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-100/80 font-medium">Today's Progress</span>
                <span className="text-xs text-white font-bold">3/7 tasks</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '43%' }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Overview</h3>
          <button className="text-xs text-blue-500 font-semibold hover:text-blue-600 transition-colors flex items-center gap-1">
            <TrendingUp size={12} /> View Stats
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={i}
              onClick={() => setActivePage(stat.id as any)}
            />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Quick Add</h3>
        <div className="flex gap-3">
          <QuickActionButton
            id="btn-add-income"
            label="Income"
            icon={DollarSign}
            onClick={() => setActivePage('income')}
          />
          <QuickActionButton
            id="btn-add-task"
            label="Task"
            icon={CalendarCheck}
            onClick={() => setActivePage('schedule')}
          />
          <QuickActionButton
            id="btn-add-gym"
            label="Gym"
            icon={Flame}
            onClick={() => setActivePage('gym')}
          />
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {[
            { emoji: '💰', title: 'Freelance Payment', sub: 'Income · 2 hrs ago', color: 'text-emerald-500' },
            { emoji: '✅', title: 'Morning standup', sub: 'Schedule · 4 hrs ago', color: 'text-blue-500' },
            { emoji: '💪', title: 'Push Day completed', sub: 'Gym · Yesterday', color: 'text-orange-500' },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <span className="text-xl w-8 text-center">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.sub}</p>
              </div>
              <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
