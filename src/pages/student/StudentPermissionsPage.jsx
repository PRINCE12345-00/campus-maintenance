import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { permissionsApi } from '../../services/api'
import { getStudentPermissions } from '../../utils/studentRecords'
import { createApprovalChain, getPermissionChain } from '../../utils/approvalWorkflow'

const permissionTypes = ['Educational', 'Cultural']

export default function StudentPermissionsPage() {
  const { permissions, setPermissions, user } = useAppContext()
  const studentPermissions = getStudentPermissions(permissions, user)
  const [type, setType] = useState('Educational')
  const [form, setForm] = useState({ title: '', purpose: '', date: '', location: '', details: '' })
  const [errors, setErrors] = useState({})
  const [responses, setResponses] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Activity title is required.'
    if (!form.purpose.trim()) nextErrors.purpose = 'Purpose is required.'
    if (!form.date) nextErrors.date = 'Date is required.'
    if (!form.location.trim()) nextErrors.location = 'Location is required.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const newPermission = {
      id: `PER-${Date.now()}`,
      type,
      title: form.title,
      purpose: form.purpose,
      date: form.date,
      location: form.location,
      status: 'Pending Approval',
      currentStage: 'Department Head',
      approvalChain: createApprovalChain(type),
      approvalHistory: [{ stage: 'Submission', status: 'Submitted', date: new Date().toISOString(), note: 'Request submitted for approval.' }],
      submittedBy: user?.name || 'Student',
      submittedById: user?.id,
      submittedByEmail: user?.email,
      department: user?.department || '',
      submittedByDepartment: user?.department || '',
      destination: user?.department || 'Department',
      faculty: 'Department Faculty',
      details: form.details || 'Permission request submitted for administrative review.',
    }

    try {
      const { data } = await permissionsApi.create(newPermission)
      setPermissions((prev) => [data, ...prev])
      setForm({ title: '', purpose: '', date: '', location: '', details: '' })
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || 'Could not submit permission request.' })
    }
  }

  const handleResubmit = async (permission) => {
    const response = responses[permission.id] || ''
    if (!response.trim()) {
      setErrors((previous) => ({ ...previous, [permission.id]: 'Please respond to the reviewer feedback before resubmitting.' }))
      return
    }
    try {
      const { data } = await permissionsApi.resubmit(permission.id, response)
      setPermissions((previous) => previous.map((item) => item.id === permission.id ? data : item))
      setResponses((previous) => ({ ...previous, [permission.id]: '' }))
      setErrors((previous) => ({ ...previous, [permission.id]: '' }))
    } catch (error) {
      setErrors((previous) => ({ ...previous, [permission.id]: error?.response?.data?.message || 'Could not resubmit this request.' }))
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <p className="page-eyebrow">Permissions</p>
        <h1 className="page-heading">Educational &amp; Cultural Requests</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Application form */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <h2 className="text-xl font-bold text-white">Apply for permission</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Permission type</label>
              <div className="grid grid-cols-2 gap-3">
                {permissionTypes.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setType(item)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${type === item ? 'border-blue-500/60 bg-blue-500/15 text-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Activity title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="Innovation Expo 2026" />
              {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={4} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="State the objective and event significance" />
              {errors.purpose && <p className="mt-2 text-sm text-red-400">{errors.purpose}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none focus:border-blue-400/60" />
                {errors.date && <p className="mt-2 text-sm text-red-400">{errors.date}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="Main Auditorium" />
                {errors.location && <p className="mt-2 text-sm text-red-400">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Additional details</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows={3} className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/60" placeholder="Participant count, faculty support, transport plan" />
            </div>

            {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}

            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.35)] transition hover:brightness-110">
              Submit request
            </button>
          </form>
        </div>

        {/* Permission records */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Permission requests</h2>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-slate-400">
              <Search size={16} /> <span className="text-sm">Search</span>
            </div>
          </div>
          <div className="space-y-4">
            {studentPermissions.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-5 text-sm text-slate-400">You have no permission requests yet.</p>
            )}
            {studentPermissions.map((permission) => (
              <div key={permission.id} className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-sky-400" />
                      <p className="font-semibold text-slate-100">{permission.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{permission.type} • {permission.location}</p>
                    <p className="mt-1 text-xs text-slate-500">{permission.date}</p>
                    <p className="mt-3 text-xs font-semibold text-sky-300">
                      {permission.status === 'Approved' ? 'Workflow complete' : permission.status === 'Rejected' ? 'Request rejected' : permission.status === 'Changes Requested' ? 'Changes requested from you' : `Current stage: ${permission.currentStage || 'Department Head'}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {getPermissionChain(permission).map((stage, index) => (
                        <span key={stage.stage} className={`rounded-full px-2 py-1 text-[11px] ${stage.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-300' : stage.status === 'Pending' ? 'bg-blue-500/15 text-blue-300' : stage.status === 'Rejected' ? 'bg-rose-500/15 text-rose-300' : 'bg-slate-700/60 text-slate-400'}`}>
                          {index + 1}. {stage.stage}: {stage.status}
                        </span>
                      ))}
                    </div>
                    <Link to={`/student/permission/${permission.id}`} className="mt-3 inline-flex text-sm font-semibold text-sky-300">View approval tracking</Link>
                    {permission.status === 'Changes Requested' && (
                      <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3">
                        <p className="text-sm font-semibold text-amber-200">Changes requested</p>
                        {permission.approvalChain?.filter((stage) => stage.status === 'Returned').map((stage) => (
                          <p key={stage.stage} className="mt-1 text-sm text-amber-300">{stage.stage}: {stage.comment}</p>
                        ))}
                        <textarea
                          value={responses[permission.id] || ''}
                          onChange={(event) => setResponses((previous) => ({ ...previous, [permission.id]: event.target.value }))}
                          rows={2}
                          placeholder="Describe your corrections or clarification"
                          className="mt-3 w-full rounded-lg border border-amber-400/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                        />
                        {errors[permission.id] && <p className="mt-2 text-sm text-red-400">{errors[permission.id]}</p>}
                        <button type="button" onClick={() => handleResubmit(permission)} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">Resubmit to Department Head</button>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={permission.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
