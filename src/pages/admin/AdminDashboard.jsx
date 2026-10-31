import { AlertTriangle, BarChart4, ClipboardCheck, FileText, ShieldCheck, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../../components/StatCard'
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
  const { complaints, permissions } = useAppContext()
  const openComplaints = complaints.filter((c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length
  const resolvedComplaints = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length
  const pendingPermissions = permissions.filter((p) => p.status === 'Under Review').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Campus operations overview</h1>
        </div>
        <Link to="/admin/complaints" className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700">Review queue</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open complaints" value={openComplaints} detail="Need action" icon={AlertTriangle} tone="amber" />
        <StatCard title="Resolved" value={resolvedComplaints} detail="Closed cases" icon={ClipboardCheck} tone="emerald" />
        <StatCard title="Pending permissions" value={pendingPermissions} detail="Awaiting decisions" icon={ShieldCheck} tone="blue" />
        <StatCard title="Analytics status" value="Demo ML" detail="Mock prediction layer active" icon={BarChart4} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Complaint trends</h2>
            <TrendingUp className="text-slate-500" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Priority actions</h2>
          <div className="mt-5 space-y-4">
            {complaints.slice(0, 4).map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{complaint.title}</p>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">{complaint.priority}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{complaint.location} • {complaint.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent actions</h2>
          <FileText size={18} className="text-slate-500" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Assigned today</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">14</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Feedback received</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">9</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Approval rate</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">89%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
