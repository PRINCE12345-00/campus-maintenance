import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertOctagon, Camera, CheckCircle2, Download, Filter, Mail, Search, Send, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import FileUpload from '../../components/FileUpload'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { complaintsApi, visionApi } from '../../services/api'
import { campusLocations, categoryOptions, formatDate } from '../../utils/formatters'
import { getStudentComplaints } from '../../utils/studentRecords'
import { compressImageForStorage } from '../../utils/evidence'
import { inspectImageClientSide } from '../../utils/visionInspector'

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
  const [visionCheck, setVisionCheck] = useState(null)
  const [isCheckingVision, setIsCheckingVision] = useState(false)
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState(null)

  const handleEvidenceChange = async (files) => {
    setEvidenceFiles(files)
    setErrors((prev) => ({ ...prev, submit: '' }))

    if (!files || files.length === 0) {
      setVisionCheck(null)
      setCurrentImageDataUrl(null)
      return
    }

    const firstImage = files.find((f) => f.type?.startsWith('image/'))
    if (!firstImage) {
      setVisionCheck(null)
      setCurrentImageDataUrl(null)
      return
    }

    setIsCheckingVision(true)
    try {
      const dataUrl = await compressImageForStorage(firstImage)
      if (dataUrl) {
        setCurrentImageDataUrl(dataUrl)

        // 1. Client-side browser inspection (runs instantly with 100% canvas pixel accuracy)
        const localCheck = await inspectImageClientSide(dataUrl, form.category)
        const safeLocalAlert = typeof localCheck.admin_alert === 'object'
          ? localCheck.admin_alert?.message || localCheck.admin_alert?.badge || ''
          : String(localCheck.admin_alert || '')
        setVisionCheck({ ...localCheck, admin_alert: safeLocalAlert })

        // 2. Query backend Python ML service if running (ignore if offline)
        try {
          const res = await visionApi.analyzeImage(dataUrl, firstImage.name, form.category)
          if (res.data?.success && !res.data?.offline) {
            const safeAlert = typeof res.data.admin_alert === 'object'
              ? res.data.admin_alert?.message || res.data.admin_alert?.badge || ''
              : String(res.data.admin_alert || '')
            setVisionCheck({ ...res.data, admin_alert: safeAlert })
          }
        } catch {
          // Keep authoritative client-side inspection result
        }
      }
    } catch (e) {
      console.log('Instant vision check error:', e)
    } finally {
      setIsCheckingVision(false)
    }
  }

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
    const priorityRank = { Emergency: 0, Critical: 0, High: 1, Medium: 2, Low: 3 }
    return getStudentComplaints(complaints, user)
      .filter((c) => {
        const matchQuery = !query || [c.title, c.location, c.category].join(' ').toLowerCase().includes(query.toLowerCase())
        const matchStatus = statusFilter === 'All' || c.status === statusFilter
        const matchCategory = categoryFilter === 'All' || c.category === categoryFilter
        return matchQuery && matchStatus && matchCategory
      })
      .sort((a, b) => {
        const rA = priorityRank[a.priority] ?? 2
        const rB = priorityRank[b.priority] ?? 2
        if (rA !== rB) return rA - rB
        const dateA = new Date(a.submissionDate || a.lastUpdated || a.createdAt || 0).getTime()
        const dateB = new Date(b.submissionDate || b.lastUpdated || b.createdAt || 0).getTime()
        return dateB - dateA
      })
  }, [complaints, user, query, statusFilter, categoryFilter])

  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize))
  const paginatedComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize)

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', submit: '' }))

    // If student changes category while an image is attached, re-verify against the new category!
    if (name === 'category' && currentImageDataUrl) {
      setIsCheckingVision(true)
      inspectImageClientSide(currentImageDataUrl, value)
        .then((recheck) => {
          const safeAlert = typeof recheck.admin_alert === 'object'
            ? recheck.admin_alert?.message || recheck.admin_alert?.badge || ''
            : String(recheck.admin_alert || '')
          setVisionCheck({ ...recheck, admin_alert: safeAlert })
        })
        .finally(() => {
          setIsCheckingVision(false)
        })
    }
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!form.location.trim()) nextErrors.location = 'Location is required.'

    // AI Computer Vision Verification Gate
    if (evidenceFiles.length > 0 && visionCheck) {
      if (!visionCheck.is_genuine || visionCheck.is_rejected || visionCheck.authenticity_score < 50) {
        nextErrors.submit = `🚫 Complaint Submission Blocked: Uploaded evidence failed AI Verification (${visionCheck.authenticity_status || 'Invalid Evidence'}). Please upload authentic physical evidence of the ${form.category} defect to submit.`
      }
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isCheckingVision) {
      setErrors((prev) => ({ ...prev, submit: 'Please wait for AI photo verification to complete before submitting.' }))
      return
    }

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
        submittedById: user?.id || user?.rollNumber || '',
        submittedByEmail: user?.email || '',
        department: user?.department || '',
        assignedTo: 'Maintenance Cell',
        submissionDate: today,
        lastUpdated: today,
        attachments,
        aiVisionResult: visionCheck,
        timeline: [{ status: 'Submitted', progress: 10, date: today, note: 'Complaint filed by student.' }],
        emailUpdates: [],
        rating: null,
        feedback: '',
      }

      const { data } = await complaintsApi.create(newComplaint)
      setComplaints((prev) => [data.complaint, ...prev])
      setForm({ category: 'Electrical', location: 'Academic Block A', destination: 'Department', title: '', description: '' })
      setEvidenceFiles([])
      setVisionCheck(null)
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 w-full min-w-0">
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

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Submit form */}
        <div className="glass-panel min-w-0 rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
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

            <FileUpload key={uploadResetKey} label="Upload evidence" onChange={handleEvidenceChange} />

            {/* Instant AI Computer Vision Verification Feedback */}
            {isCheckingVision && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 animate-pulse">
                <Camera size={15} /> Scanning photo with AI Computer Vision for defect authenticity...
              </div>
            )}

            {visionCheck && !isCheckingVision && (
              <div className={`rounded-xl border p-3.5 text-xs transition-all ${
                visionCheck.is_genuine && !visionCheck.is_rejected && visionCheck.authenticity_score >= 50
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    {visionCheck.is_genuine && !visionCheck.is_rejected && visionCheck.authenticity_score >= 50 ? (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    ) : (
                      <AlertOctagon size={15} className="text-rose-400" />
                    )}
                    AI Evidence Status: {visionCheck.authenticity_status}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                    visionCheck.is_genuine && !visionCheck.is_rejected && visionCheck.authenticity_score >= 50
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {visionCheck.authenticity_score}% Authenticity
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-200 mt-1">
                  {typeof visionCheck.admin_alert === 'object'
                    ? visionCheck.admin_alert?.message || visionCheck.admin_alert?.badge || ''
                    : String(visionCheck.admin_alert || '')}
                </p>
                {visionCheck.defect_class && (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Detected Visual Pattern: <span className="font-semibold text-white">{visionCheck.defect_class}</span> ({visionCheck.quality?.status})
                  </p>
                )}
                {visionCheck.reasons?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {visionCheck.reasons.map((r, i) => (
                      <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">
                        • {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mandatory Physical On-Site Inspection Requirement Notice */}
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/40 p-2.5 text-[11px] text-amber-200 flex items-start gap-2">
                  <ShieldAlert size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Mandatory On-Site Physical Inspection Required: </span>
                    <span className="text-slate-300">
                      AI photo audit is preliminary screening only. A certified campus technician must conduct an in-person physical inspection at <strong className="text-white">{form.location}</strong> to verify operational safety and diagnose internal equipment faults before repair work begins.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Gate Block Warning */}
            {evidenceFiles.length > 0 && visionCheck && (!visionCheck.is_genuine || visionCheck.is_rejected || visionCheck.authenticity_score < 50) && !isCheckingVision && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertOctagon size={16} /> Complaint Submission Blocked by AI Verification Gate
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The uploaded photo cannot be verified as authentic <strong>{form.category}</strong> maintenance damage. Submitting selfies, personal portraits, or unrelated images is strictly prohibited.
                </p>
                <p className="text-[11px] text-rose-400 font-medium">
                  Please attach a clear photo of the physical {form.category} defect or remove the invalid attachment to enable submission.
                </p>
              </div>
            )}

            {errors.submit && <p role="alert" className="text-sm text-red-400">{errors.submit}</p>}

            {(() => {
              const isEvidenceRejected = Boolean(
                evidenceFiles.length > 0 &&
                visionCheck &&
                (!visionCheck.is_genuine || visionCheck.is_rejected || visionCheck.authenticity_score < 50)
              )
              return (
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingVision || isEvidenceRejected}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow transition ${
                    isEvidenceRejected
                      ? 'bg-rose-900/40 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-80'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_14px_28px_rgba(37,99,235,0.35)] hover:brightness-110 disabled:cursor-wait disabled:opacity-60'
                  }`}
                >
                  {isSubmitting ? (
                    'Submitting…'
                  ) : isCheckingVision ? (
                    'Verifying Photo with AI…'
                  ) : isEvidenceRejected ? (
                    '🚫 Submission Blocked (Invalid Evidence)'
                  ) : (
                    <>
                      <Send size={18} /> Submit complaint
                    </>
                  )}
                </button>
              )
            })()}
          </form>
        </div>

        {/* Records */}
        <div className="glass-panel min-w-0 rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-white">Complaint records</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-2.5 py-1.5 sm:px-3 sm:py-2">
                <Search size={15} className="text-slate-400" />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search" className="w-24 sm:w-28 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-2.5 py-1.5 sm:px-3 sm:py-2">
                <Filter size={15} className="text-slate-400" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border-0 bg-transparent text-xs sm:text-sm text-slate-100 outline-none">
                  {['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((o) => <option key={o} className="bg-slate-900">{o}</option>)}
                </select>
              </div>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-slate-900/50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-slate-100 outline-none">
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
                  <div key={complaint.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/8 bg-slate-900/40 p-4 transition hover:border-white/15">
                    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <p className="font-semibold text-slate-100">{complaint.title}</p>
                          <StatusBadge status={complaint.status} />
                          <span className="font-mono text-xs text-slate-400">({complaint.id})</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400 truncate">{complaint.category} • {complaint.location} • {formatDate(complaint.submissionDate)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:text-white">
                          <Download size={14} /> Download
                        </button>
                        <Link to={`/student/complaint/${complaint.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                          <Mail size={13} /> View Updates
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="mt-1 min-w-0 rounded-xl bg-slate-800/40 p-3 border border-white/5">
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
                        <div className="mt-2.5 flex min-w-0 items-start gap-2 rounded-lg bg-blue-950/40 p-2.5 text-xs text-slate-300 border border-blue-500/20">
                          <Mail size={14} className="mt-0.5 shrink-0 text-teal-400" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-teal-300">Admin Email Update: </span>
                            <span className="text-slate-300 break-words leading-relaxed">{latestEmail.message}</span>
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
