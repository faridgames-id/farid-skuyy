import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply persisted theme immediately to avoid flash
const storedRaw = localStorage.getItem('farid-tracker-store')
if (storedRaw) {
  try {
    const stored = JSON.parse(storedRaw)
    if (stored?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
