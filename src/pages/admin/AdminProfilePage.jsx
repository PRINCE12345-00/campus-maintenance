import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { usersApi } from '../../services/api'

export default function AdminProfilePage() {
  const { user, setUser, complaints, permissions } = useAppContext()

  const [formData, setFormData] = useState({
    name: user?.name || 'Prince Chahal',
    email: user?.email || 'chahalprince0481@gmail.com',
    phone: user?.phone || '+91 94160 XXXXX',
    department: user?.department || 'Administrative Office',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [banner, setBanner] = useState({ type: '', message: '' })

  const initials = (formData.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setBanner({ type: '', message: '' })

    const identifier = user?.id || user?.email || 'ADM-9001'

    try {
      await usersApi.update(identifier, {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
      })

      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
      }
      setUser(updatedUser)
      localStorage.setItem('scms-user', JSON.stringify(updatedUser))

      setBanner({ type: 'success', message: '✓ Administrator profile updated successfully!' })
    } catch {
      const updatedUser = { ...user, name: formData.name, phone: formData.phone }
      setUser(updatedUser)
      localStorage.setItem('scms-user', JSON.stringify(updatedUser))
      setBanner({ type: 'success', message: '✓ Admin settings updated locally!' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 5000)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!passwordData.newPassword) {
      window.alert('Please enter a new password.')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      window.alert('New password and confirm password do not match.')
      return
    }

    setIsChangingPassword(true)
    const identifier = user?.id || user?.email || 'ADM-9001'

    try {
      await usersApi.update(identifier, {
        password: passwordData.newPassword,
        oldPassword: passwordData.oldPassword,
      })

      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setBanner({ type: 'success', message: '✓ Administrator password changed successfully!' })
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not update password.')
    } finally {
      setIsChangingPassword(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 5000)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      {/* Title Row */}
      <div>
        <p className="page-eyebrow">Admin Workspace</p>
        <h1 className="page-heading">Administrator Profile &amp; Credentials</h1>
        <p className="mt-1 text-xs text-slate-400">
          Super Admin administrative controls, contact information, and security management.
        </p>
      </div>

      {banner.message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-4 text-emerald-200 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{banner.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Column: Official Admin Badge & Scope */}
        <div className="space-y-6">
          <div className="glass-panel relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-purple-300">DCRUST MURTHAL</p>
                <p className="text-xs font-semibold text-white">Central Administration</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-200">
                <ShieldCheck size={12} /> Super Admin
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-xl font-extrabold text-white shadow-xl shadow-purple-500/30 ring-2 ring-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{formData.name}</h3>
                <p className="font-mono text-xs font-semibold text-purple-300">Admin ID: ADM-9001</p>
                <p className="text-xs text-slate-300 truncate">{formData.department}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-purple-400" />
                <span className="font-mono text-slate-200">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-purple-400" />
                <span>Executive Office, Administrative Block</span>
              </div>
            </div>
          </div>

          {/* System Control Overview */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Administration Oversight</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between text-blue-300">
                  <FileText size={18} />
                  <span className="text-xl font-bold">{complaints.length}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">Active Complaints</p>
                <p className="text-[11px] text-slate-400">Total campus tickets</p>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                <div className="flex items-center justify-between text-purple-300">
                  <FileCheck size={18} />
                  <span className="text-xl font-bold">{permissions.length}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">Permission Workflows</p>
                <p className="text-[11px] text-slate-400">Super Admin clearance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Settings */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
              <User size={18} className="text-purple-400" />
              <h2 className="text-base font-bold">Admin Information &amp; Contact</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-medium">Administrator Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Official Office Email</label>
                  <input
                    readOnly
                    type="email"
                    value={formData.email}
                    className="mt-1.5 w-full rounded-xl border border-white/5 bg-slate-900/70 p-3 text-slate-400 font-mono outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-medium">Department / Office</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Direct Phone / Intercom</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94160 XXXXX"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save Admin Settings'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
              <KeyRound size={18} className="text-amber-400" />
              <h2 className="text-base font-bold">Admin Security &amp; Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3.5 text-xs">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-slate-300 font-medium">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition disabled:opacity-50"
                >
                  <Lock size={13} />
                  <span>{isChangingPassword ? 'Updating...' : 'Update Admin Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
