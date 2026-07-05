import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
}

type Theme = 'light' | 'dark'

type ActivePage = 'dashboard' | 'income' | 'schedule' | 'gym' | 'analytics' | 'savings' | 'profile'

interface AppState {
  // Auth
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  // Theme
  theme: Theme
  toggleTheme: () => void

  // Navigation
  activePage: ActivePage
  setActivePage: (page: ActivePage) => void

  // Splash
  splashDone: boolean
  setSplashDone: (done: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        clearAllLocalData()
        window.location.reload()
      },

      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),

      activePage: 'dashboard',
      setActivePage: (activePage) => set({ activePage }),

      splashDone: false,
      setSplashDone: (splashDone) => set({ splashDone }),
    }),
    {
      name: 'farid-tracker-store',
      // Persist theme and user session
      partialize: (state) => ({ theme: state.theme, user: state.user }),
      onRehydrateStorage: () => (state?: AppState) => {
        if (state?.theme) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)

export function clearAllLocalData() {
  localStorage.removeItem('farid-income-store')
  localStorage.removeItem('farid-gym-store')
  localStorage.removeItem('farid-schedule-store')
  localStorage.removeItem('farid-savings-store')
  // Note: we don't remove 'farid-tracker-store' entirely so we keep the theme
}
