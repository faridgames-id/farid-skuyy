import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  emoji: string
  description: string
}

export default function PlaceholderPage({ title, emoji, description }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-4xl mb-6 shadow-lg">
        {emoji}
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
        <Construction size={13} />
        Coming in the next build
      </div>
    </motion.div>
  )
}
