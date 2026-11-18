import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  FileCheck,
  FileText,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { usersApi } from '../../services/api'
import { getStudentComplaints, getStudentPermissions } from '../../utils/studentRecords'

export default function StudentProfilePage() {
  const { user, setUser, complaints, permissions } = useAppContext()

  // Calculate live stats for student
  const studentComplaints = useMemo(() => getStudentComplaints(complaints, user), [complaints, user])
  const studentPermissions = useMemo(() => getStudentPermissions(permissions, user), [permissions, user])

  const initialName = user?.name || 'Pankaj Kumar'
  const initialEmail = user?.email || 'pankajsulekh255@gmail.com'
  const initialRollNumber = user?.rollNumber || user?.id || '23001001076'
  const initialDept = user?.department || 'Computer Science & Engineering'
  const initialBatch = user?.batch || '2026'
  const initialHostel = user?.hostel || 'Boys Hostel Block A, Room 204'
  const initialPhone = user?.phone || '+91 98765 43210'

  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    rollNumber: initialRollNumber,
    department: initialDept,
    batch: initialBatch,
    hostel: initialHostel,
    phone: initialPhone,
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [mobilePushEnabled, setMobilePushEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [banner, setBanner] = useState({ type: '', message: '' })

  const initials = (formData.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setBanner({ type: '', message: '' })

    const identifier = user?.id || user?.rollNumber || user?.email || '23001001076'

    try {
      await usersApi.update(identifier, {
        name: formData.name,
        phone: formData.phone,
        hostel: formData.hostel,
        department: formData.department,
      })

      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        hostel: formData.hostel,
        department: formData.department,
      }
      setUser(updatedUser)
      localStorage.setItem('scms-user', JSON.stringify(updatedUser))

      setBanner({ type: 'success', message: '✓ Profile details saved and updated successfully!' })
    } catch {
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        hostel: formData.hostel,
      }
      setUser(updatedUser)
      localStorage.setItem('scms-user', JSON.stringify(updatedUser))
      setBanner({ type: 'success', message: '✓ Profile settings updated locally!' })
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
    const identifier = user?.id || user?.rollNumber || user?.email || '23001001076'

    try {
      await usersApi.update(identifier, {
        password: passwordData.newPassword,
        oldPassword: passwordData.oldPassword,
      })

      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setBanner({ type: 'success', message: '✓ Password changed successfully!' })
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not change password.')
    } finally {
      setIsChangingPassword(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 5000)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      {/* Page Title */}
      <div>
        <p className="page-eyebrow">Student Workspace</p>
        <h1 className="page-heading">My Profile &amp; Settings</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your personal university credentials, contact info, hostel residence, and security preferences.
        </p>
      </div>

      {/* Success Notification Banner */}
      {banner.message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-4 text-emerald-200 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{banner.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Column: Digital Campus ID Card & Activity */}
        <div className="space-y-6">
          {/* Digital Student ID Card */}
          <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-sky-300">DCRUST MURTHAL</p>
                <p className="text-xs font-semibold text-white">Smart Campus Identity</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <ShieldCheck size={12} /> Verified Student
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-xl font-extrabold text-white shadow-xl shadow-blue-500/30 ring-2 ring-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{formData.name}</h3>
                <p className="font-mono text-xs font-semibold text-sky-300">Roll No: {formData.rollNumber}</p>
                <p className="text-xs text-slate-300 truncate">{formData.department}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Batch Year</p>
                <p className="font-semibold text-white mt-0.5">{formData.batch}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Program</p>
                <p className="font-semibold text-white mt-0.5">B.Tech Engineering</p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Registered Email</p>
                <p className="font-mono text-xs text-slate-200 mt-0.5 truncate">{formData.email}</p>
              </div>
            </div>
          </div>

          {/* Activity Badges */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Campus Activity Snapshot</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between text-blue-300">
                  <FileText size={18} />
                  <span className="text-xl font-bold">{studentComplaints.length}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">Maintenance Complaints</p>
                <p className="text-[11px] text-slate-400">Filed across campus</p>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                <div className="flex items-center justify-between text-purple-300">
                  <FileCheck size={18} />
                  <span className="text-xl font-bold">{studentPermissions.length}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">Permission Requests</p>
                <p className="text-[11px] text-slate-400">Educational &amp; cultural</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Settings & Security */}
        <div className="space-y-6">
          {/* Personal Information Form */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
              <User size={18} className="text-sky-400" />
              <h2 className="text-base font-bold">Personal &amp; Contact Details</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Roll Number / Student ID</label>
                  <input
                    readOnly
                    type="text"
                    value={formData.rollNumber}
                    className="mt-1.5 w-full rounded-xl border border-white/5 bg-slate-900/70 p-3 text-slate-400 font-mono outline-none cursor-not-allowed"
                    title="Student roll number cannot be modified directly"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-medium">University Email</label>
                  <div className="relative mt-1.5">
                    <input
                      readOnly
                      type="email"
                      value={formData.email}
                      className="w-full rounded-xl border border-white/5 bg-slate-900/70 p-3 text-slate-400 font-mono outline-none cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-400">Verified</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Phone Number</label>
                  <div className="relative mt-1.5">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-medium">Department / Branch</label>
                  <input
                    readOnly
                    type="text"
                    value={formData.department}
                    className="mt-1.5 w-full rounded-xl border border-white/5 bg-slate-900/70 p-3 text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Hostel &amp; Room Details</label>
                  <input
                    type="text"
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    placeholder="Boys Hostel Block A, Room 204"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800/80 p-3 text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="pt-2 space-y-2.5">
                <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-800/40 p-3 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Mail size={16} className="text-sky-400" />
                    <span>Email Updates for Complaints &amp; Permissions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-800/40 p-3 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Smartphone size={16} className="text-purple-400" />
                    <span>Mobile Lock-Screen Push Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mobilePushEnabled}
                    onChange={(e) => setMobilePushEnabled(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
              <KeyRound size={18} className="text-amber-400" />
              <h2 className="text-base font-bold">Security &amp; Change Password</h2>
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
                  <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
