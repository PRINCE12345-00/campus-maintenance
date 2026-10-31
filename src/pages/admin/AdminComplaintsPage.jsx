import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'

const statusOptions = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']

export default function AdminComplaintsPage() {
  const { complaints, setComplaints } = useAppContext()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => complaints.filter((complaint) => {
    const matchQuery = !query || [complaint.id, complaint.category, complaint.title, complaint.location].join(' ').toLowerCase().includes(query.toLowerCase())
    const matchStatus = status === 'All' || complaint.status === status
    return matchQuery && matchStatus
  }), [complaints, query, status])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const updateStatus = (id, nextStatus) => {
    setComplaints((prev) => prev.map((item) => item.id === id ? { ...item, status: nextStatus, lastUpdated: new Date().toISOString().slice(0, 10) } : item))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Admin panel</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Complaint management</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search complaints" className="w-52 border-0 bg-transparent text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border-0 bg-transparent text-sm outline-none">
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Complaint</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Evidence</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-sm text-slate-700">
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.id}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{item.category}</td>
                  <td className="py-4 pr-4">{item.location}</td>
                  <td className="py-4 pr-4">
                    {item.attachments?.some((file) => typeof file === 'object' && file.dataUrl) ? (
                      <div className="flex items-center gap-2">
                        {item.attachments.filter((file) => typeof file === 'object' && file.dataUrl).slice(0, 2).map((file) => (
                          <a key={file.name} href={file.dataUrl} target="_blank" rel="noreferrer" title={`View ${file.name}`}>
                            <img src={file.dataUrl} alt={`Evidence for ${item.title}`} className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No preview</span>
                    )}
                  </td>
                  <td className="py-4 pr-4"><StatusBadge status={item.status} /></td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2">
                      <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none">
                        {statusOptions.filter((option) => option !== 'All').map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                      <Link to={`/admin/complaint/${item.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">Details</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
