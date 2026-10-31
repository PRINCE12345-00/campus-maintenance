import { BarChart3, BellRing, ClipboardList, FileWarning, ShieldCheck, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { getStudentComplaints, getStudentNotifications, getStudentPermissions } from '../../utils/studentRecords'

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

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
    underReview: studentPermissions.filter((p) => p.status === 'Under Review').length,
  }

  const chartData = [
    { name: 'Submitted', value: studentComplaints.filter((c) => c.status === 'Submitted').length },
    { name: 'Assigned', value: studentComplaints.filter((c) => c.status === 'Assigned').length },
    { name: 'In Progress', value: studentComplaints.filter((c) => c.status === 'In Progress').length },
    { name: 'Resolved', value: studentComplaints.filter((c) => c.status === 'Resolved').length },
    { name: 'Closed', value: studentComplaints.filter((c) => c.status === 'Closed').length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Student dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/complaints" className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700">Submit complaint</Link>
          <Link to="/student/permissions" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">Apply for permission</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total complaints" value={complaintCounts.total} detail="Across all categories" icon={ClipboardList} tone="blue" />
        <StatCard title="Pending" value={complaintCounts.pending} detail="Awaiting action" icon={FileWarning} tone="amber" />
        <StatCard title="Resolved" value={complaintCounts.resolved} detail="Successfully closed" icon={TrendingUp} tone="emerald" />
        <StatCard title="Permission requests" value={permissionCounts.total} detail={`${permissionCounts.approved} approved`} icon={ShieldCheck} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Complaint status</h2>
            <BarChart3 size={18} className="text-slate-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent activity</h2>
            <BellRing size={18} className="text-slate-500" />
          </div>
          <div className="space-y-4">
            {studentNotifications.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">No activity yet. Updates will appear here when you submit a complaint or permission request.</p>
            )}
            {studentNotifications.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  </div>
                  {!item.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent complaints</h2>
            <Link to="/student/complaints" className="text-sm font-semibold text-blue-600">View all</Link>
          </div>
          <div className="space-y-4">
            {studentComplaints.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">You have no complaints yet. Use “Submit complaint” to report a campus issue.</p>
            )}
            {studentComplaints.slice(0, 3).map((complaint) => (
              <div key={complaint.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{complaint.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{complaint.location} • {complaint.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={complaint.status} />
                  <Link to={`/student/complaint/${complaint.id}`} className="text-sm font-semibold text-blue-600">Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Permission overview</h2>
            <ShieldCheck size={18} className="text-slate-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Approved', value: permissionCounts.approved },
                  { name: 'Under Review', value: permissionCounts.underReview },
                  { name: 'Rejected', value: studentPermissions.filter((p) => p.status === 'Rejected').length },
                ]} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={4}>
                  {['#10b981', '#f59e0b', '#ef4444'].map((color, index) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
