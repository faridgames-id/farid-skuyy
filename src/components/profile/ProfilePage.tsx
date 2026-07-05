// src/components/profile/ProfilePage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, CheckCircle2, LogOut, Shield, Trophy, Star, Download, Upload, Database, Trash2, Sun, Moon, AlertTriangle, UserCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAppStore, clearAllLocalData } from '../../store/appStore'
import { restoreBackupToCloud, wipeCloudData } from '../../lib/cloudSync'
import { useIncomeStore } from '../../store/incomeStore'
import { useScheduleStore } from '../../store/scheduleStore'
import { useGymStore } from '../../store/gymStore'
import { getLocalISOString, getLocalISOMonth } from '../../utils/date'

function toISO(d: Date) { return getLocalISOString(d) }

export default function ProfilePage() {
  const { user, setUser, logout, theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'
  const incomeEntries = useIncomeStore((s) => s.entries)
  const scheduleTasks = useScheduleStore((s) => s.tasks)
  const gymSessions = useGymStore((s) => s.sessions)

  const [displayName, setDisplayName] = useState(user?.displayName ?? 'Farid')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nameEdit, setNameEdit] = useState(displayName)
  const [descEdit, setDescEdit] = useState(description)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const [showWipeConfirm, setShowWipeConfirm] = useState(false)

  const avatarOptions = [
    "", // Initials
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Joker&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Shadow&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Bandit&backgroundColor=d1d4f9"
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setUser({ ...user, photoURL: dataUrl })
        setShowAvatarPicker(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Stats
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const totalIncome = incomeEntries
    .filter((e) => e.date.startsWith(thisMonthKey))
    .reduce((s, e) => s + e.amount, 0)
  const completedGym = gymSessions.filter((s) => s.isCompleted && s.date.startsWith(thisMonthKey)).length
  const todayTasks = scheduleTasks.filter((t) => t.date === toISO(now))
  const doneTodayTasks = todayTasks.filter((t) => t.isCompleted)

  // XP Calculation
  const totalTasksDone = scheduleTasks.filter(t => t.isCompleted).length
  const totalGymDone = gymSessions.filter(s => s.isCompleted).length
  const xp = (totalTasksDone * 10) + (totalGymDone * 50) + 6000 
  
  const ranks = [
    { level: 2, name: 'Hustler', xp: 500, icon: '🔥' },
    { level: 3, name: 'Builder', xp: 1500, icon: '🏗️' },
    { level: 4, name: 'Entrepreneur', xp: 4000, icon: '💼' },
    { level: 5, name: 'CEO', xp: 10000, icon: '👑' },
  ]

  function formatRpShort(n: number) {
    return n.toLocaleString('id-ID')
  }

  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600)) // simulate async
    setDisplayName(nameEdit)
    setDescription(descEdit)
    if (user) setUser({ ...user, displayName: nameEdit })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleCancel() {
    setNameEdit(displayName)
    setDescEdit(description)
    setEditing(false)
  }

  const handleExportData = () => {
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('farid-')) {
        data[key] = localStorage.getItem(key) || ''
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farid-tracker-backup-${getLocalISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        clearAllLocalData() // only clear the feature stores before importing
        Object.keys(data).forEach(key => {
          if (key.startsWith('farid-') && key !== 'farid-tracker-store') {
            const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key])
            localStorage.setItem(key, value)
          }
        })
        
        const user = useAppStore.getState().user
        if (user && !user.uid.startsWith('guest-')) {
          toast.loading('Syncing to Cloud...', { id: 'cloud-sync' })
          restoreBackupToCloud(user.uid, data).then(() => {
            toast.success('Data imported successfully! The page will now reload.', { id: 'cloud-sync', icon: '📦' })
            setTimeout(() => window.location.reload(), 1500)
          }).catch(() => {
            toast.error('Failed to sync with Cloud.', { id: 'cloud-sync' })
            setTimeout(() => window.location.reload(), 1500)
          })
        } else {
          toast.success('Data imported successfully! The page will now reload.', { icon: '📦' })
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (err) {
        toast.error('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    setShowWipeConfirm(true)
  }

  const confirmResetData = () => {
    // Clear local storage
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('farid-')) keys.push(key)
    }
    keys.forEach(k => localStorage.removeItem(k))
    
    const user = useAppStore.getState().user
    if (user && !user.uid.startsWith('guest-')) {
      toast.loading('Wiping Cloud Data...', { id: 'cloud-wipe' })
      wipeCloudData(user.uid).then(() => {
        toast.success('All data cleared! Reloading...', { id: 'cloud-wipe', icon: '🧹' })
        setShowWipeConfirm(false)
        setTimeout(() => window.location.reload(), 1500)
      }).catch(() => {
        toast.error('Failed to wipe Cloud data.', { id: 'cloud-wipe' })
        setShowWipeConfirm(false)
        setTimeout(() => window.location.reload(), 1500)
      })
    } else {
      toast.success('All local data cleared! Reloading...', { icon: '🧹' })
      setShowWipeConfirm(false)
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-2">
        <div className="relative mb-4 group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 overflow-hidden relative shadow-sm">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-400 dark:text-slate-500">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil size={18} className="text-white" />
            </div>
          </div>
          {/* Active indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white text-center">{displayName}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email ?? 'farid@example.com'}</p>

        {/* Active badge */}
        <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          Active
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarPicker(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border border-slate-200/50 dark:border-slate-800/50"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Choose Avatar</h3>
              <div className="grid grid-cols-3 gap-4">
                {avatarOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (user) setUser({ ...user, photoURL: opt })
                      setShowAvatarPicker(false)
                    }}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      (user?.photoURL || '') === opt
                        ? 'border-blue-500 shadow-md shadow-blue-500/20 scale-105'
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {opt ? (
                      <img src={opt} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="font-bold text-slate-400">{initials}</span>
                      </div>
                    )}
                  </button>
                ))}

                {/* Upload from Gallery Option */}
                <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <span className="text-[10px] font-bold">Gallery</span>
                </label>
              </div>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Edit form */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
        {/* Form header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
              <UserCircle size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Profile & Details</h3>
          </div>
          {!editing && (
            <motion.button
              id="btn-edit-profile"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditing(true); setNameEdit(displayName); setDescEdit(description) }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 transition-all border border-white/10"
            >
              <Pencil size={14} strokeWidth={2.5} />
              <span className="text-xs font-bold">Edit</span>
            </motion.button>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Name field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
            {editing ? (
              <input
                id="profile-name"
                type="text"
                value={nameEdit}
                onChange={(e) => setNameEdit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-sm text-slate-900 dark:text-white font-medium">{displayName}</span>
                <Pencil size={11} className="text-slate-400 dark:text-slate-600" />
              </div>
            )}
          </div>

          {/* Description field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            {editing ? (
              <textarea
                id="profile-description"
                rows={3}
                value={descEdit}
                onChange={(e) => setDescEdit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none leading-relaxed"
              />
            ) : (
              <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
              </div>
            )}
          </div>

          {/* Email field (read-only) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">{user?.email ?? 'farid@example.com'}</span>
              <Shield size={11} className="text-emerald-500 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Action buttons (only when editing) */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2.5 border-t border-slate-200 dark:border-[#334155] pt-4">
                <motion.button
                  id="btn-save-profile"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 active:scale-95 disabled:opacity-70"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saving…</motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <CheckCircle2 size={15} /> Save Changes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <button
                  id="btn-cancel-profile"
                  onClick={handleCancel}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-[#334155] text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-900 border border-emerald-700 text-emerald-300 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl z-50"
          >
            <CheckCircle2 size={15} /> Profile saved!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export / Import Data */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-300 dark:border-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-5 relative overflow-hidden">
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-8 -mb-8" />

        <div className="relative z-10 flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
            <Database size={16} />
          </div>
          <h3 className="text-slate-800 dark:text-white font-extrabold text-lg tracking-tight">Data Management</h3>
        </div>
        
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
              onClick={handleExportData}
              className="group flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg transition-all overflow-hidden relative border border-white/10"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125" />
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Download size={18} className="text-white" />
              </div>
              <span className="text-sm drop-shadow-sm">Export Backup</span>
            </motion.button>
            
            <motion.label 
              whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
              className="group flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[1.25rem] bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-bold shadow-md hover:shadow-lg transition-all overflow-hidden relative cursor-pointer border border-white/10"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125" />
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Upload size={18} className="text-white" />
              </div>
              <span className="text-sm drop-shadow-sm">Restore Data</span>
              <input 
                type="file" 
                accept="application/json"
                className="hidden" 
                onChange={handleImportData}
              />
            </motion.label>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            onClick={handleResetData}
            className="group relative overflow-hidden w-full flex flex-col items-center justify-center py-3 mt-1 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white shadow-md hover:shadow-lg transition-all border border-red-400/30"
          >
            {/* Animated glowing background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center justify-center gap-2 relative z-10">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 group-hover:rotate-12 transition-transform duration-300">
                <Trash2 size={14} className="text-white drop-shadow-md" />
              </div>
              <span className="text-sm font-bold tracking-wide drop-shadow-md">Wipe All Data</span>
            </div>
            
            {/* Striped overlay pattern for texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwTDQwIDQwWk00MCA0MEwwIDBaIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwTDQwIDQwWk00MCA0MEwwIDBaIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMEw0MCA0ME0wIDQwTDQwIDBNMjAgMEwyMCA0ME0wIDIwTDQwIDIwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] pointer-events-none mix-blend-overlay" />
          </motion.button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Account</h3>
        <button
          id="btn-sign-out"
          onClick={() => setShowSignoutConfirm(true)}
          className="relative overflow-hidden group w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-sm hover:shadow-md hover:from-red-600 hover:to-rose-600 transition-all duration-300"
        >
          {/* Bubbles motif */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/10 dark:bg-red-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-rose-400/10 dark:bg-rose-500/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          
          <LogOut size={16} className="relative z-10" />
          <span className="relative z-10">Sign Out</span>
        </button>
      </div>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showWipeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWipeConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 relative z-10 shadow-2xl border border-red-200/50 dark:border-red-900/50 text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
              
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400 relative z-10 shadow-inner">
                <AlertTriangle size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 relative z-10">Wipe All Data?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                Are you SURE you want to clear all your local data? This action <span className="font-bold text-red-500">cannot be undone!</span>
              </p>
              
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setShowWipeConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetData}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 transition-all"
                >
                  Wipe It
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSignoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 relative z-10 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to sign out of your account?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await signOut(auth)
                    } catch (e) {
                      console.error("Sign out error", e)
                    }
                    logout()
                    setShowSignoutConfirm(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="text-center text-[10px] text-slate-600 font-medium py-2">
        v1.1 | © Farid's
      </p>
    </motion.div>
  )
}
