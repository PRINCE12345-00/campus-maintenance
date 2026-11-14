import { motion } from 'framer-motion'
import { AlertTriangle, BarChart4, ClipboardCheck, FileText, ShieldCheck, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'

const chartData = [
  { name: 'Jan', complaints: 18 },
  { name: 'Feb', complaints: 26 },
  { name: 'Mar', complaints: 21 },
  { name: 'Apr', complaints: 34 },
  { name: 'May', complaints: 29 },
  { name: 'Jun', complaints: 38 },
]

export default function AdminDashboard() {
  const { complaints, permissions, user } = useAppContext()
  const openComplaints = complaints.filter((c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length
  const resolvedComplaints = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length
  const pendingPermissions = permissions.filter((p) => p.status === 'Pending Approval').length
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Admin'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="page-header-row">
        <div>
          <p className="page-eyebrow">Admin dashboard</p>
          <h1 className="page-heading">Welcome, {firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/complaints" className="premium-button">Review complaints</Link>
          <Link to="/admin/permissions" className="premium-button premium-button-secondary">Review permissions</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open complaints" value={openComplaints} detail="Need action" icon={AlertTriangle} tone="amber" />
        <StatCard title="Resolved" value={resolvedComplaints} detail="Closed cases" icon={ClipboardCheck} tone="emerald" />
        <StatCard title="Pending permissions" value={pendingPermissions} detail="Awaiting decisions" icon={ShieldCheck} tone="blue" />
        <StatCard title="Analytics" value="Demo ML" detail="Mock prediction active" icon={BarChart4} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Complaint trends</h2>
            <TrendingUp className="text-sky-300" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="url(#adminBar)" />
                <defs>
                  <linearGradient id="adminBar" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <h2 className="mb-4 text-xl font-bold text-white">Priority actions</h2>
          <div className="space-y-3">
            {complaints.slice(0, 4).map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-100">{complaint.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${complaint.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : complaint.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'}`}>{complaint.priority}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{complaint.location} • {complaint.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Quick stats</h2>
          <FileText size={18} className="text-sky-300" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-400">Assigned today</p>
            <p className="mt-2 text-2xl font-bold text-white">14</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-400">Feedback received</p>
            <p className="mt-2 text-2xl font-bold text-white">9</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-400">SLA breaches</p>
            <p className="mt-2 text-2xl font-bold text-rose-400">2</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent complaints</h2>
          <Link to="/admin/complaints" className="text-sm font-semibold text-sky-300">View all</Link>
        </div>
        <div className="space-y-3">
          {complaints.slice(0, 5).map((complaint) => (
            <div key={complaint.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-900/40 p-4">
              <div>
                <p className="font-semibold text-slate-100">{complaint.title}</p>
                <p className="mt-1 text-sm text-slate-400">{complaint.category} • {complaint.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.status} />
                <Link to={`/admin/complaint/${complaint.id}`} className="text-sm font-semibold text-sky-300">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
