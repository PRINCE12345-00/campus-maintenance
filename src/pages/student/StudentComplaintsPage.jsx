import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Filter, Mail, Search, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import FileUpload from '../../components/FileUpload'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { complaintsApi } from '../../services/api'
import { campusLocations, categoryOptions, formatDate } from '../../utils/formatters'
import { getStudentComplaints } from '../../utils/studentRecords'
import { compressImageForStorage } from '../../utils/evidence'

export default function StudentComplaintsPage() {
  const { complaints, setComplaints, user } = useAppContext()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [uploadResetKey, setUploadResetKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState({
    category: 'Electrical',
    location: 'Academic Block A',
    destination: 'Department',
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!successMessage) return undefined
    const timeoutId = window.setTimeout(() => setSuccessMessage(''), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  const filteredComplaints = useMemo(() => {
    return getStudentComplaints(complaints, user).filter((c) => {
      const matchQuery = !query || [c.title, c.location, c.category].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusFilter === 'All' || c.status === statusFilter
      const matchCategory = categoryFilter === 'All' || c.category === categoryFilter
      return matchQuery && matchStatus && matchCategory
    })
  }, [complaints, user, query, statusFilter, categoryFilter])

  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize))
  const paginatedComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize)

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!form.location.trim()) nextErrors.location = 'Location is required.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      const attachments = await Promise.all(evidenceFiles.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: file.type.startsWith('image/') ? await compressImageForStorage(file) : null,
      })))

      const today = new Date().toISOString().slice(0, 10)
      const newComplaint = {
        id: `CMP-${Date.now()}`,
        category: form.category,
        location: form.location,
        destination: form.destination === 'Department' ? `${user?.department || 'Department'} Department` : form.destination,
        title: form.title,
        description: form.description,
        status: 'Submitted',
        progress: 10,
        priority: 'Medium',
        submittedBy: user?.name || 'Student',
        submittedById: user?.id,
        submittedByEmail: user?.email || 'aarav@student.dcrust.in',
        department: user?.department || '',
        assignedTo: 'Maintenance Cell',
        submissionDate: today,
        lastUpdated: today,
        attachments,
        timeline: [{ status: 'Submitted', progress: 10, date: today, note: 'Complaint filed by student.' }],
        emailUpdates: [],
        rating: null,
        feedback: '',
      }

      const { data } = await complaintsApi.create(newComplaint)
      setComplaints((prev) => [data.complaint, ...prev])
      setForm({ category: 'Electrical', location: 'Academic Block A', destination: 'Department', title: '', description: '' })
      setEvidenceFiles([])
      setUploadResetKey((key) => key + 1)
      const emailResult = data.notifications?.email
      if (emailResult?.sent) {
        setSuccessMessage('Complaint submitted and confirmation email sent.')
      } else if (emailResult?.mode === 'dry-run') {
        setSuccessMessage('Complaint submitted. Email not configured — check SMTP settings.')
      } else {
        setSuccessMessage('Complaint submitted successfully.')
      }
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || error.message || 'Could not submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {successMessage && (
        <div role="status" aria-live="polite" className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900 px-5 py-4 text-emerald-300 shadow-xl">
          <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="page-header-row">
        <div>
          <p className="page-eyebrow">Complaint management</p>
          <h1 className="page-heading">My Complaints</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Submit form */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <h2 className="text-xl font-bold text-white">Submit a complaint</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Complaint category</label>
              <select name="category" value={form.category} onChange={handleFormChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none focus:border-blue-400/60">
                {categoryOptions.map((category) => <option key={category} value={category} className="bg-slate-900">{category}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Campus location</label>
              <select name="location" value={form.location} onChange={handleFormChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none focus:border-blue-400/60">
                {campusLocations.map((location) => <option key={location} value={location} className="bg-slate-900">{location}</option>)}
              </select>
              {errors.location && <p className="mt-2 text-sm text-red-400">{errors.location}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Route complaint to</label>
              <select name="destination" value={form.destination} onChange={handleFormChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none focus:border-blue-400/60">
                {[`${user?.department || 'Department'} Department`, 'DSW', 'Registrar', 'Vice Chancellor'].map((office) => (
                  <option key={office} value={office.endsWith(' Department') ? 'Department' : office} className="bg-slate-900">{office}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Issue title</label>
              <input name="title" value={form.title} onChange={handleFormChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="Example: Broken fan in lab" />
              {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={5} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="Describe the issue and any visible damage." />
              {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
            </div>

            <FileUpload key={uploadResetKey} label="Upload evidence" onChange={setEvidenceFiles} />

            {errors.submit && <p role="alert" className="text-sm text-red-400">{errors.submit}</p>}

            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.35)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
              <Send size={18} /> {isSubmitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        </div>

        {/* Records */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-white">Complaint records</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search" className="w-28 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
                <Filter size={16} className="text-slate-400" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border-0 bg-transparent text-sm text-slate-100 outline-none">
                  {['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((o) => <option key={o} className="bg-slate-900">{o}</option>)}
                </select>
              </div>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none">
                <option className="bg-slate-900">All</option>
                {categoryOptions.map((o) => <option key={o} className="bg-slate-900">{o}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {paginatedComplaints.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-6 text-slate-400">
                <AlertCircle size={18} /> No complaints match your filters.
              </div>
            ) : (
              paginatedComplaints.map((complaint) => {
                const progressValue = complaint.progress !== undefined && complaint.progress !== null
                  ? complaint.progress
                  : (complaint.status === 'Resolved' || complaint.status === 'Closed' ? 100 : complaint.status === 'In Progress' ? 50 : 20)
                const latestEmail = complaint.emailUpdates?.[0]

                return (
                  <div key={complaint.id} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-slate-900/40 p-4 transition hover:border-white/15">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold text-slate-100">{complaint.title}</p>
                          <StatusBadge status={complaint.status} />
                          <span className="font-mono text-xs text-slate-400">({complaint.id})</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{complaint.category} • {complaint.location} • {formatDate(complaint.submissionDate)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:text-white">
                          <Download size={14} /> Download
                        </button>
                        <Link to={`/student/complaint/${complaint.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                          <Mail size={13} /> View Updates
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="mt-1 rounded-xl bg-slate-800/40 p-3 border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-400">Resolution Progress</span>
                        <span className={progressValue === 100 ? 'text-emerald-400 font-bold' : 'text-teal-400 font-bold'}>
                          {progressValue}% Resolved
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${Math.max(4, progressValue)}%` }}
                        />
                      </div>

                      {/* Latest Email / Admin message preview */}
                      {latestEmail && (
                        <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-blue-950/40 p-2 text-xs text-slate-300 border border-blue-500/20">
                          <Mail size={14} className="mt-0.5 shrink-0 text-teal-400" />
                          <div className="truncate">
                            <span className="font-semibold text-teal-300">Admin Email Update: </span>
                            <span className="text-slate-300">{latestEmail.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
