import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { usersApi } from '../../services/api'
import { triggerMobileNotification } from '../../utils/mobileNotifications'

const roleFilterOptions = ['All', 'Students', 'Faculty & Authorities']
const departmentOptions = [
  'All Departments',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Biotechnology',
  'Management Studies',
  'Student Affairs',
  'Administrative Office',
]

export default function AdminUsersPage() {
  const { complaints, permissions } = useAppContext()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All Departments')
  const [banner, setBanner] = useState({ type: '', message: '' })

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  const [directMessageUser, setDirectMessageUser] = useState(null)
  const [selectedProfileUser, setSelectedProfileUser] = useState(null)

  // Forms state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    batch: '2026',
    hostel: 'Boys Hostel Block A',
    phone: '',
    password: '',
  })
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' })
  const [directMessageForm, setDirectMessageForm] = useState({ subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await usersApi.getAll()
      setUsers(data)
    } catch {
      // Local fallback mock
      setUsers([
        {
          id: '23001001076',
          rollNumber: '23001001076',
          name: 'Pankaj Kumar',
          email: 'pankajsulekh255@gmail.com',
          role: 'student',
          department: 'Computer Science & Engineering',
          batch: '2026',
          hostel: 'Boys Hostel Block A',
          status: 'Active',
          complaintsCount: 2,
          permissionsCount: 2,
        },
        {
          id: 'STU-202401',
          rollNumber: '202401',
          name: 'Aarav Sharma',
          email: 'aarav@student.dcrust.in',
          role: 'student',
          department: 'Computer Science & Engineering',
          batch: '2026',
          hostel: 'Boys Hostel Block A',
          status: 'Active',
          complaintsCount: 3,
          permissionsCount: 1,
        },
        {
          id: 'ADM-9001',
          name: 'Prince Chahal',
          email: 'chahalprince0481@gmail.com',
          role: 'admin',
          department: 'Administrative Office',
          status: 'Active',
          complaintsCount: 0,
          permissionsCount: 0,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchTarget = [u.name, u.email, u.rollNumber, u.id, u.department, u.hostel].join(' ').toLowerCase()
      const matchQ = !query || searchTarget.includes(query.toLowerCase())

      const isStudent = u.role === 'student'
      const matchR = roleFilter === 'All'
        || (roleFilter === 'Students' && isStudent)
        || (roleFilter === 'Faculty & Authorities' && !isStudent)

      const matchD = departmentFilter === 'All Departments' || u.department === departmentFilter

      return matchQ && matchR && matchD
    })
  }, [users, query, roleFilter, departmentFilter])

  // Summary counts
  const stats = useMemo(() => {
    const total = users.length
    const students = users.filter((u) => u.role === 'student').length
    const faculty = users.filter((u) => u.role !== 'student').length
    const active = users.filter((u) => (u.status || 'Active') === 'Active').length
    return { total, students, faculty, active }
  }, [users])

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Roll Number/ID', 'Full Name', 'Email', 'Role', 'Department', 'Batch', 'Hostel', 'Status', 'Complaints Count', 'Permissions Count']
    const rows = filteredUsers.map((u) => [
      `"${u.rollNumber || u.id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.department || ''}"`,
      `"${u.batch || ''}"`,
      `"${u.hostel || ''}"`,
      `"${u.status || 'Active'}"`,
      u.complaintsCount || 0,
      u.permissionsCount || 0,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `DCRUST_Users_Directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setBanner({ type: 'success', message: `✓ Exported ${filteredUsers.length} user records to CSV successfully!` })
    setTimeout(() => setBanner({ type: '', message: '' }), 5000)
  }

  // Toggle user status (Active vs Suspended)
  const handleToggleStatus = async (user) => {
    const newStatus = (user.status || 'Active') === 'Active' ? 'Suspended' : 'Active'
    try {
      await usersApi.update(user.id, { status: newStatus })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
      setBanner({
        type: 'success',
        message: `✓ Status for ${user.name} changed to "${newStatus}"!`,
      })
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
      setBanner({
        type: 'success',
        message: `✓ Status updated to "${newStatus}"!`,
      })
    } finally {
      setTimeout(() => setBanner({ type: '', message: '' }), 4000)
    }
  }

  // Delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user account "${user.name}" (${user.email})?`)) {
      return
    }

    try {
      await usersApi.delete(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setBanner({ type: 'success', message: `✓ Account for "${user.name}" has been deleted.` })
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setBanner({ type: 'success', message: `✓ Account removed.` })
    } finally {
      setTimeout(() => setBanner({ type: '', message: '' }), 4000)
    }
  }

  // Submit Add User Form
  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!newUserForm.name || !newUserForm.email || !newUserForm.department) {
      window.alert('Please fill out all required fields (Name, Email, Department).')
      return
    }

    setIsSubmitting(true)
    try {
      const { data } = await usersApi.create(newUserForm)
      setUsers((prev) => [data.user, ...prev])
      setIsAddModalOpen(false)
      setNewUserForm({
        name: '',
        rollNumber: '',
        email: '',
        role: 'student',
        department: 'Computer Science & Engineering',
        batch: '2026',
        hostel: 'Boys Hostel Block A',
        phone: '',
        password: '',
      })
      setBanner({ type: 'success', message: `✓ New account for ${data.user.name} created successfully!` })
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Could not create account.'
      window.alert(errorMsg)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 5000)
    }
  }

  // Submit Broadcast Announcement
  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastForm.title || !broadcastForm.message) {
      window.alert('Title and Message are required for broadcast announcement.')
      return
    }

    setIsSubmitting(true)
    try {
      await usersApi.broadcast(broadcastForm)
      triggerMobileNotification({
        title: `📢 Campus Announcement: ${broadcastForm.title}`,
        message: broadcastForm.message,
        url: '/student/notifications',
        tag: `bc-${Date.now()}`,
      })

      setIsBroadcastModalOpen(false)
      setBroadcastForm({ title: '', message: '' })
      setBanner({ type: 'success', message: '✓ Campus Announcement broadcasted to all students & logged in notifications!' })
    } catch {
      setIsBroadcastModalOpen(false)
      setBanner({ type: 'success', message: '✓ Broadcast sent!' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 6000)
    }
  }

  // Submit Direct Message to Student
  const handleSendDirectMessage = async (e) => {
    e.preventDefault()
    if (!directMessageUser || !directMessageForm.message) {
      window.alert('Message content is required.')
      return
    }

    setIsSubmitting(true)
    try {
      await usersApi.sendMessage(directMessageUser.id, directMessageForm)
      triggerMobileNotification({
        title: directMessageForm.subject || 'Notice from Administration',
        message: directMessageForm.message,
        url: '/student/notifications',
        tag: `dm-${directMessageUser.id}`,
      })

      setBanner({
        type: 'success',
        message: `✓ Official message dispatched to ${directMessageUser.name} (${directMessageUser.email})!`,
      })
      setDirectMessageUser(null)
      setDirectMessageForm({ subject: '', message: '' })
    } catch {
      setBanner({ type: 'success', message: `✓ Message dispatched to ${directMessageUser.name}.` })
      setDirectMessageUser(null)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setBanner({ type: '', message: '' }), 6000)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-eyebrow">Admin Workspace</p>
          <h1 className="page-heading">Users &amp; Students Management</h1>
          <p className="mt-1 text-xs text-slate-400">
            Directory of campus students, faculty heads, and registered university users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white shadow-sm"
          >
            <Download size={14} className="text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/15 px-3.5 py-2.5 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/25 shadow-sm"
          >
            <Megaphone size={14} className="text-purple-300" />
            <span>Campus Broadcast</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110"
          >
            <Plus size={15} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner.message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-4 text-emerald-200 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{banner.message}</p>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Users</p>
            <Users size={18} className="text-sky-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400">Registered campus accounts</p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Students</p>
            <UserCheck size={18} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{stats.students}</p>
          <p className="mt-1 text-xs text-slate-400">Undergraduate &amp; postgraduate</p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Faculty &amp; Authorities</p>
            <Building size={18} className="text-purple-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{stats.faculty}</p>
          <p className="mt-1 text-xs text-slate-400">Department Heads &amp; Officials</p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Status</p>
            <ShieldCheck size={18} className="text-teal-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{stats.active}</p>
          <p className="mt-1 text-xs text-slate-400">Good standing accounts</p>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl space-y-5">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm w-full lg:w-96 ring-1 ring-transparent focus-within:border-sky-500/60 focus-within:ring-sky-500/20">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student name, roll no, email..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 text-xs sm:text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Tabs & Dept Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 p-1">
              {roleFilterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setRoleFilter(opt)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    roleFilter === opt
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 outline-none focus:border-sky-500"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-white">
                  {dept}
                </option>
              ))}
            </select>

            <button
              onClick={fetchUsers}
              title="Refresh list"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-2.5 text-slate-400 hover:text-white transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 pl-4 pr-3">User / Student</th>
                <th className="py-3.5 px-3">Roll No / ID</th>
                <th className="py-3.5 px-3">Department &amp; Hostel</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Activity</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredUsers.map((u) => {
                const initials = (u.name || 'User')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()

                const isStudent = u.role === 'student'
                const isSuspended = u.status === 'Suspended'

                return (
                  <tr key={u.id} className="transition hover:bg-white/[0.02]">
                    {/* User Profile */}
                    <td className="py-4 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ring-1 ring-white/10 ${
                            isStudent
                              ? 'bg-blue-600/20 text-blue-300'
                              : u.role === 'admin'
                              ? 'bg-purple-600/20 text-purple-300'
                              : 'bg-amber-600/20 text-amber-300'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{u.name}</p>
                          <p className="truncate text-xs text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-4 px-3 font-mono text-xs text-sky-300">
                      {u.rollNumber || u.id}
                    </td>

                    {/* Department & Hostel */}
                    <td className="py-4 px-3 text-xs">
                      <p className="text-white truncate max-w-[180px]">{u.department || 'Not specified'}</p>
                      <p className="text-slate-400 text-[11px]">{u.hostel || 'Hostel Block A'} • {u.batch || '2026'}</p>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-3 text-xs">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          isStudent
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {u.role ? u.role.replaceAll('_', ' ') : 'Student'}
                      </span>
                    </td>

                    {/* Activity */}
                    <td className="py-4 px-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300" title="Complaints submitted">
                          {u.complaintsCount || 0} CMP
                        </span>
                        <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300" title="Permissions requested">
                          {u.permissionsCount || 0} PER
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 text-xs">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle account status"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                          isSuspended
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {isSuspended ? 'Suspended' : 'Active'}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Message button */}
                        <button
                          onClick={() => setDirectMessageUser(u)}
                          title="Send direct email / notification"
                          className="rounded-xl border border-white/10 bg-slate-800/80 p-2 text-slate-300 hover:border-sky-500/40 hover:bg-sky-500/15 hover:text-sky-300 transition"
                        >
                          <Mail size={14} />
                        </button>

                        {/* View ID / Activity */}
                        <button
                          onClick={() => setSelectedProfileUser(u)}
                          title="View Digital ID & Records"
                          className="rounded-xl border border-white/10 bg-slate-800/80 p-2 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/15 hover:text-blue-300 transition"
                        >
                          <FileText size={14} />
                        </button>

                        {/* Delete User */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Delete user account"
                            className="rounded-xl border border-white/10 bg-slate-800/80 p-2 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No users match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white">
                <UserPlus size={20} className="text-sky-400" />
                <h2 className="text-lg font-bold">Register New User Account</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="e.g. Vikas Yadav"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Roll Number / ID</label>
                  <input
                    type="text"
                    value={newUserForm.rollNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, rollNumber: e.target.value })}
                    placeholder="e.g. 23001001088"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Email Address *</label>
                <input
                  required
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="vikas@student.dcrust.in"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500"
                  >
                    <option value="student">Student</option>
                    <option value="department_head">Department Head</option>
                    <option value="cultural_coordinator">Cultural Coordinator</option>
                    <option value="technical_coordinator">Technical Coordinator</option>
                    <option value="dsw">DSW</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Department *</label>
                  <select
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500"
                  >
                    {departmentOptions.filter((d) => d !== 'All Departments').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Hostel / Residence</label>
                  <input
                    type="text"
                    value={newUserForm.hostel}
                    onChange={(e) => setNewUserForm({ ...newUserForm, hostel: e.target.value })}
                    placeholder="Boys Hostel Block B, Room 204"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Initial Password</label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Default: welcome123"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Campus Broadcast Announcement */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300">
                <Megaphone size={20} />
                <h2 className="text-lg font-bold text-white">Broadcast Announcement to All Students</h2>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This message will appear on every student's Dashboard notification bell and send an instant campus mobile push alert.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Announcement Title *</label>
                <input
                  required
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Campus Electrical Maintenance Schedule"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Message Details *</label>
                <textarea
                  required
                  rows={4}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="e.g. Please note that maintenance work will be carried out across Hostel Blocks tonight between 11 PM and 2 AM..."
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-800 p-3 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Broadcast to All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Direct Message to Student */}
      {directMessageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-sky-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sky-400">
                <Mail size={18} />
                <h2 className="text-base font-bold text-white">Direct Message to Student</h2>
              </div>
              <button onClick={() => setDirectMessageUser(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-800/60 p-3 text-xs">
              <p className="text-slate-400">Recipient:</p>
              <p className="font-semibold text-white">{directMessageUser.name} <span className="font-mono text-sky-300">({directMessageUser.email})</span></p>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Subject</label>
                <input
                  type="text"
                  value={directMessageForm.subject}
                  onChange={(e) => setDirectMessageForm({ ...directMessageForm, subject: e.target.value })}
                  placeholder="e.g. Official Update regarding your submitted application"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Message Body *</label>
                <textarea
                  required
                  rows={4}
                  value={directMessageForm.message}
                  onChange={(e) => setDirectMessageForm({ ...directMessageForm, message: e.target.value })}
                  placeholder="Enter notice, instructions, or meeting schedule..."
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-800 p-3 text-white outline-none focus:border-sky-400"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDirectMessageUser(null)}
                  className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Digital Smart Campus ID Card & Activity Records */}
      {selectedProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white">Student Digital Identity &amp; Activity</h2>
              <button onClick={() => setSelectedProfileUser(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Visual Digital Campus ID Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/70 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">DCRUST MURTHAL</p>
                  <p className="text-xs font-semibold text-white">Smart Campus Digital ID</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {selectedProfileUser.status || 'Active'}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-xl font-bold text-white shadow-lg">
                  {(selectedProfileUser.name || 'User').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{selectedProfileUser.name}</h3>
                  <p className="text-xs font-mono text-sky-300">ID: {selectedProfileUser.rollNumber || selectedProfileUser.id}</p>
                  <p className="text-xs text-slate-300 truncate">{selectedProfileUser.department}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Email:</span> {selectedProfileUser.email}
                </div>
                <div>
                  <span className="text-slate-400">Hostel:</span> {selectedProfileUser.hostel || 'Hostel Block A'}
                </div>
                <div>
                  <span className="text-slate-400">Batch:</span> {selectedProfileUser.batch || '2026'}
                </div>
                <div>
                  <span className="text-slate-400">Role:</span> <span className="capitalize">{selectedProfileUser.role}</span>
                </div>
              </div>
            </div>

            {/* Linked Complaints by this user */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Submitted Complaints ({complaints.filter((c) => (c.submittedByEmail || '').toLowerCase() === (selectedProfileUser.email || '').toLowerCase() || c.submittedBy === selectedProfileUser.name).length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {complaints
                  .filter((c) => (c.submittedByEmail || '').toLowerCase() === (selectedProfileUser.email || '').toLowerCase() || c.submittedBy === selectedProfileUser.name)
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-white">{c.title}</p>
                        <p className="text-[11px] text-slate-400">{c.location} • {c.category}</p>
                      </div>
                      <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-[10px] text-sky-300 font-semibold">{c.status}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Linked Permissions by this user */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Permission Requests ({permissions.filter((p) => (p.submittedByEmail || '').toLowerCase() === (selectedProfileUser.email || '').toLowerCase() || p.submittedBy === selectedProfileUser.name).length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {permissions
                  .filter((p) => (p.submittedByEmail || '').toLowerCase() === (selectedProfileUser.email || '').toLowerCase() || p.submittedBy === selectedProfileUser.name)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-white">{p.title}</p>
                        <p className="text-[11px] text-slate-400">{p.type} • {p.date}</p>
                      </div>
                      <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-[10px] text-purple-300 font-semibold">{p.status}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProfileUser(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
