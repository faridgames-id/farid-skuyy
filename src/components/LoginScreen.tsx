import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

async function handleGoogleLogin(setUser: (u: any) => void) {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    setUser({
      uid: user.uid,
      displayName: user.displayName || 'User',
      email: user.email || '',
      photoURL: user.photoURL,
    })
  } catch (error: any) {
    console.error("Login failed:", error)
    toast.error(`Login failed: ${error.message || 'Check your Firebase config.'}`)
  }
}

function handleGuestLogin(setUser: (u: any) => void) {
  setUser({
    uid: 'guest-' + Date.now(),
    displayName: 'Guest User',
    email: 'guest@example.com',
    photoURL: null,
  })
}

export default function LoginScreen() {
  const setUser = useAppStore((s) => s.setUser)

  return (
    <div className="min-h-dvh bg-white dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-[100px] pointer-events-none" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/80 p-8 border border-slate-200/80 dark:border-slate-700/50">
            {/* Logo block */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                <svg width="34" height="34" viewBox="0 0 56 56" fill="none">
                  <path d="M18 36 L22 26 L28 32 L34 20 L38 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="38" cy="28" r="3.5" fill="white" opacity="0.9"/>
                  <circle cx="18" cy="36" r="2.5" fill="white" opacity="0.7"/>
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Farid Tracker
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                Your personal command center
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sign in to continue</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Google Login Button */}
            <div className="flex flex-col gap-3">
              <motion.button
                id="btn-google-login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGoogleLogin(setUser)}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 active:scale-95"
              >
                <LogIn size={20} />
                Continue with Google
              </motion.button>

              {/* Guest Login Button */}
              <motion.button
                id="btn-guest-login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGuestLogin(setUser)}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-semibold py-3 px-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300 active:scale-95"
              >
                <User size={20} />
                Continue as Guest
              </motion.button>
            </div>

            {/* Terms */}
            <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>

          {/* Feature hints */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { emoji: '💰', label: 'Income' },
              { emoji: '📅', label: 'Schedule' },
              { emoji: '💪', label: 'Gym' },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center gap-1 shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
