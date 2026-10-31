import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Filter, Search, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import FileUpload from '../../components/FileUpload'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
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
    return getStudentComplaints(complaints, user).filter((complaint) => {
      const matchQuery = !query || [complaint.title, complaint.location, complaint.category].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusFilter === 'All' || complaint.status === statusFilter
      const matchCategory = categoryFilter === 'All' || complaint.category === categoryFilter
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
        title: form.title,
        description: form.description,
        status: 'Submitted',
        priority: 'Medium',
        submittedBy: user?.name || 'Student',
        submittedById: user?.id,
        submittedByEmail: user?.email,
        assignedTo: 'Maintenance Cell',
        submissionDate: today,
        lastUpdated: today,
        attachments,
        timeline: [{ status: 'Submitted', date: today, note: 'Complaint filed by student.' }],
        rating: null,
        feedback: '',
      }

      setComplaints((prev) => [newComplaint, ...prev])
      setForm({ category: 'Electrical', location: 'Academic Block A', title: '', description: '' })
      setEvidenceFiles([])
      setUploadResetKey((key) => key + 1)
      setSuccessMessage('Complaint submitted successfully!')
    } catch (error) {
      setErrors({ submit: error.message || 'Could not attach the selected evidence. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div role="status" aria-live="polite" className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-emerald-800 shadow-xl">
          <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Complaint management</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Complaints</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Submit a complaint</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Complaint category</label>
              <select name="category" value={form.category} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500">
                {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Campus location</label>
              <select name="location" value={form.location} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500">
                {campusLocations.map((location) => <option key={location} value={location}>{location}</option>)}
              </select>
              {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Issue title</label>
              <input name="title" value={form.title} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="Example: Broken fan in lab" />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="Describe the issue and any visible damage." />
              {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
            </div>

            <FileUpload key={uploadResetKey} label="Upload evidence" onChange={setEvidenceFiles} />

            {errors.submit && <p role="alert" className="text-sm text-red-600">{errors.submit}</p>}

            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
              <Send size={18} /> {isSubmitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Complaint records</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-32 border-0 bg-transparent text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Filter size={16} className="text-slate-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-0 bg-transparent text-sm outline-none">
                  <option>All</option>
                  <option>Submitted</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                <option>All</option>
                {categoryOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {paginatedComplaints.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                <AlertCircle size={18} /> No complaints match your filters.
              </div>
            ) : (
              paginatedComplaints.map((complaint) => (
                <div key={complaint.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-800">{complaint.title}</p>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{complaint.category} • {complaint.location} • {formatDate(complaint.submissionDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <Download size={16} /> Download
                    </button>
                    <Link to={`/student/complaint/${complaint.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Details</Link>
                  </div>
                </div>
              ))
            )}
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
    </div>
  )
}
