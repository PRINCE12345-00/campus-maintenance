import { motion } from 'framer-motion'
import { ArrowUpDown, Mail, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { complaintsApi } from '../../services/api'

const statusOptions = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']
const PAGE_SIZE = 8

const priorityRank = {
  Emergency: 0,
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
}

export default function AdminComplaintsPage() {
  const { complaints, setComplaints } = useAppContext()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('priority_desc') // Default: High -> Medium -> Low
  const [page, setPage] = useState(1)

  // Quick priority counts for filter pills
  const priorityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 }
    complaints.forEach((c) => {
      const p = c.priority || 'Medium'
      if (p === 'High' || p === 'Critical' || p === 'Emergency') counts.High++
      else if (p === 'Low') counts.Low++
      else counts.Medium++
    })
    return counts
  }, [complaints])

  const rows = useMemo(() => {
    return complaints
      .filter((c) => {
        const matchQ = !query || [c.title, c.location, c.category, c.priority, c.id, c.submittedBy].join(' ').toLowerCase().includes(query.toLowerCase())
        const matchS = status === 'All' || c.status === status
        const matchP = priorityFilter === 'All' || (c.priority || 'Medium').toLowerCase() === priorityFilter.toLowerCase()
        return matchQ && matchS && matchP
      })
      .sort((a, b) => {
        if (sortBy === 'priority_desc') {
          const rA = priorityRank[a.priority] ?? 2
          const rB = priorityRank[b.priority] ?? 2
          if (rA !== rB) return rA - rB
        } else if (sortBy === 'priority_asc') {
          const rA = priorityRank[a.priority] ?? 2
          const rB = priorityRank[b.priority] ?? 2
          if (rA !== rB) return rB - rA
        } else if (sortBy === 'oldest') {
          const dateA = new Date(a.submissionDate || a.lastUpdated || a.createdAt || 0).getTime()
          const dateB = new Date(b.submissionDate || b.lastUpdated || b.createdAt || 0).getTime()
          return dateA - dateB
        }
        // Secondary sort: newest complaints first
        const dateA = new Date(a.submissionDate || a.lastUpdated || a.createdAt || 0).getTime()
        const dateB = new Date(b.submissionDate || b.lastUpdated || b.createdAt || 0).getTime()
        return dateB - dateA
      })
  }, [complaints, query, status, priorityFilter, sortBy])

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
          <p className="text-xs text-slate-400 mt-1">
            Prioritized automatically by severity: <span className="text-rose-400 font-semibold">High Priority</span> first, followed by <span className="text-amber-400 font-semibold">Medium</span> and <span className="text-emerald-400 font-semibold">Low</span>.
          </p>
        </div>
      </div>

      {/* Priority KPI Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setPriorityFilter('All'); setPage(1) }}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            priorityFilter === 'All'
              ? 'bg-blue-600 text-white shadow-md'
              : 'border border-white/10 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Complaints ({complaints.length})
        </button>
        <button
          type="button"
          onClick={() => { setPriorityFilter('High'); setPage(1) }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            priorityFilter === 'High'
              ? 'bg-rose-500 text-white shadow-md'
              : 'border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
          High Priority ({priorityCounts.High})
        </button>
        <button
          type="button"
          onClick={() => { setPriorityFilter('Medium'); setPage(1) }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            priorityFilter === 'Medium'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Medium Priority ({priorityCounts.Medium})
        </button>
        <button
          type="button"
          onClick={() => { setPriorityFilter('Low'); setPage(1) }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            priorityFilter === 'Low'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Low Priority ({priorityCounts.Low})
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search complaints, title, student..."
              className="w-60 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Order Selector */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                className="border-0 bg-transparent text-xs text-slate-100 outline-none cursor-pointer"
              >
                <option value="priority_desc" className="bg-slate-900">Sort: High → Med → Low (Default)</option>
                <option value="priority_asc" className="bg-slate-900">Sort: Low → Med → High</option>
                <option value="newest" className="bg-slate-900">Sort: Newest First</option>
                <option value="oldest" className="bg-slate-900">Sort: Oldest First</option>
              </select>
            </div>

            {/* Status Filter Selector */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5">
              <SlidersHorizontal size={16} className="text-slate-400" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="border-0 bg-transparent text-xs text-slate-100 outline-none cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    Status: {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-medium pr-4">Complaint</th>
                <th className="pb-3 font-medium pr-4">Priority</th>
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

                const isHigh = item.priority === 'High' || item.priority === 'Critical' || item.priority === 'Emergency'
                const isMedium = item.priority === 'Medium'

                return (
                  <tr key={item.id} className="border-b border-white/5 text-sm text-slate-300 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-semibold text-slate-100">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500">{item.id} • {item.category}</span>
                          {item.evidenceStatus === 'Approved' ? (
                            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                              Photo: Verified ✓
                            </span>
                          ) : item.evidenceStatus === 'Rejected' ? (
                            <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                              Photo: Rejected ✕
                            </span>
                          ) : item.attachments?.length ? (
                            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                              Photo: Review ⏳
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Dedicated Priority Column */}
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-400 animate-pulse'
                            : isMedium
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`} />
                        {item.priority || 'Medium'}
                      </span>
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
                            <option key={o} value={o} className="bg-slate-900">{o}</option>
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
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">No complaints match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {page} of {totalPages} ({rows.length} total)</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
