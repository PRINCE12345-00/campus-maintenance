import { BarChart3, BellRing, ClipboardList, FileWarning, ShieldCheck, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { getStudentComplaints, getStudentNotifications, getStudentPermissions } from '../../utils/studentRecords'
import { getPermissionChain } from '../../utils/approvalWorkflow'

export default function StudentDashboard() {
  const { complaints, permissions, notifications, user } = useAppContext()
  const studentComplaints = getStudentComplaints(complaints, user)
  const studentPermissions = getStudentPermissions(permissions, user)
  const studentNotifications = getStudentNotifications(notifications, user)
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Student'

  const complaintCounts = {
    total: studentComplaints.length,
    pending: studentComplaints.filter((c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length,
    resolved: studentComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length,
  }

  const permissionCounts = {
    total: studentPermissions.length,
    approved: studentPermissions.filter((p) => p.status === 'Approved').length,
    underReview: studentPermissions.filter((p) => ['Under Review', 'Pending Approval', 'Changes Requested'].includes(p.status)).length,
  }

  const chartData = [
    { name: 'Submitted', value: studentComplaints.filter((c) => c.status === 'Submitted').length },
    { name: 'Assigned', value: studentComplaints.filter((c) => c.status === 'Assigned').length },
    { name: 'In Progress', value: studentComplaints.filter((c) => c.status === 'In Progress').length },
    { name: 'Resolved', value: studentComplaints.filter((c) => c.status === 'Resolved').length },
    { name: 'Closed', value: studentComplaints.filter((c) => c.status === 'Closed').length },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="page-header-row">
        <div>
          <p className="page-eyebrow">Student dashboard</p>
          <h1 className="page-heading">Welcome, {firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/complaints" className="premium-button">Submit complaint</Link>
          <Link to="/student/permissions" className="premium-button premium-button-secondary">Apply for permission</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total complaints" value={complaintCounts.total} detail="Across all categories" icon={ClipboardList} tone="blue" />
        <StatCard title="Pending" value={complaintCounts.pending} detail="Awaiting action" icon={FileWarning} tone="amber" />
        <StatCard title="Resolved" value={complaintCounts.resolved} detail="Successfully closed" icon={TrendingUp} tone="emerald" />
        <StatCard title="Permission requests" value={permissionCounts.total} detail={`${permissionCounts.approved} approved`} icon={ShieldCheck} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Complaint status</h2>
            <BarChart3 size={18} className="text-sky-300" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="url(#complaintBar)" />
                <defs>
                  <linearGradient id="complaintBar" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent activity</h2>
            <BellRing size={18} className="text-sky-300" />
          </div>
          <div className="space-y-4">
            {studentNotifications.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-sm text-slate-400">No activity yet. Updates will appear here when you submit a complaint or permission request.</p>
            )}
            {studentNotifications.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                  </div>
                  {!item.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent complaints</h2>
            <Link to="/student/complaints" className="text-sm font-semibold text-sky-300">View all</Link>
          </div>
          <div className="space-y-4">
            {studentComplaints.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-sm text-slate-400">You have no complaints yet. Use “Submit complaint” to report a campus issue.</p>
            )}
            {studentComplaints.slice(0, 3).map((complaint) => (
              <div key={complaint.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{complaint.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{complaint.location} • {complaint.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={complaint.status} />
                  <Link to={`/student/complaint/${complaint.id}`} className="text-sm font-semibold text-sky-300">Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Permission overview</h2>
            <ShieldCheck size={18} className="text-sky-300" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Approved', value: permissionCounts.approved },
                  { name: 'Under Review', value: permissionCounts.underReview },
                  { name: 'Rejected', value: studentPermissions.filter((p) => p.status === 'Rejected').length },
                ]} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={4}>
                  {['#34d399', '#fbbf24', '#f87171'].map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)', borderRadius: '12px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Permission approval tracking</h2>
            <p className="mt-1 text-sm text-slate-400">Follow each request through the approval offices.</p>
          </div>
          <Link to="/student/permissions" className="text-sm font-semibold text-sky-300">All requests</Link>
        </div>
        <div className="space-y-4">
          {studentPermissions.length === 0 && <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-sm text-slate-400">Permission requests you submit will appear here.</p>}
          {studentPermissions.slice(0, 3).map((permission) => (
            <div key={permission.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{permission.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{permission.type} · {permission.status === 'Approved' ? 'Complete' : permission.status === 'Rejected' ? 'Rejected' : `Awaiting ${permission.currentStage || 'Department Head'}`}</p>
                </div>
                <Link to={`/student/permission/${permission.id}`} className="text-sm font-semibold text-sky-300">Track request</Link>
              </div>
              {permission.status === 'Changes Requested' && (
                <div className="mt-3 rounded-xl border border-warning/25 bg-amber-500/10 p-3">
                  <p className="text-sm font-semibold text-amber-200">Changes requested by the reviewer</p>
                  {permission.approvalChain?.filter((stage) => stage.status === 'Returned').map((stage) => (
                    <p key={stage.stage} className="mt-1 text-sm text-amber-100"><strong>{stage.stage}:</strong> {stage.comment || 'Please review the request and contact the department.'}</p>
                  ))}
                  <Link to="/student/permissions" className="mt-2 inline-flex text-sm font-semibold text-sky-300">Open request and respond</Link>
                </div>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {getPermissionChain(permission).map((stage) => (
                  <div key={stage.stage} className={`rounded-xl px-3 py-2 text-xs ${stage.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20' : stage.status === 'Pending' ? 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20' : stage.status === 'Rejected' ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20' : 'bg-slate-800/80 text-slate-300 ring-1 ring-white/5'}`}>
                    <p className="font-semibold">{stage.stage}</p>
                    <p className="mt-1">{stage.status}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
