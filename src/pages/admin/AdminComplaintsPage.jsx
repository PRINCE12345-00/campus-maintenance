import { motion } from 'framer-motion'
import { Mail, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { complaintsApi } from '../../services/api'

const statusOptions = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']
const PAGE_SIZE = 8

export default function AdminComplaintsPage() {
  const { complaints, setComplaints } = useAppContext()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    return complaints.filter((c) => {
      const matchQ = !query || [c.title, c.location, c.category].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchS = status === 'All' || c.status === status
      return matchQ && matchS
    })
  }, [complaints, query, status])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await complaintsApi.updateStatus(id, newStatus)
      setComplaints((prev) => prev.map((c) => (c.id === id ? data.complaint : c)))
    } catch {
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="page-header-row">
        <div>
          <p className="page-eyebrow">Admin</p>
          <h1 className="page-heading">Complaint management</h1>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search complaints"
              className="w-52 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="border-0 bg-transparent text-sm text-slate-100 outline-none"
            >
              {statusOptions.map((option) => <option key={option} className="bg-slate-900">{option}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-medium pr-4">Complaint</th>
                <th className="pb-3 font-medium pr-4">Student</th>
                <th className="pb-3 font-medium pr-4">Location</th>
                <th className="pb-3 font-medium pr-4">Route</th>
                <th className="pb-3 font-medium pr-4">Progress</th>
                <th className="pb-3 font-medium pr-4">Status</th>
                <th className="pb-3 font-medium">Action & Email</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((item) => {
                const progressValue = item.progress !== undefined && item.progress !== null
                  ? item.progress
                  : (item.status === 'Resolved' || item.status === 'Closed' ? 100 : item.status === 'In Progress' ? 50 : 20)

                return (
                  <tr key={item.id} className="border-b border-white/5 text-sm text-slate-300">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-semibold text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.id} • {item.category}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{item.submittedBy}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">{item.submittedByEmail || 'aarav@student.dcrust.in'}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">{item.location}</td>
                    <td className="py-4 pr-4">{item.destination || 'Department'}</td>
                    <td className="py-4 pr-4">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-teal-300">{progressValue}%</span>
                          <span className="text-[10px] text-slate-400">
                            {item.emailUpdates?.length ? `${item.emailUpdates.length} mails` : '0 mails'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
                            style={{ width: `${Math.max(5, progressValue)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4"><StatusBadge status={item.status} /></td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 outline-none"
                        >
                          {statusOptions.filter((o) => o !== 'All').map((o) => (
                            <option key={o} className="bg-slate-900">{o}</option>
                          ))}
                        </select>
                        <Link
                          to={`/admin/complaint/${item.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 shadow-sm"
                        >
                          <Mail size={13} /> Notify / Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-400">No complaints match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
