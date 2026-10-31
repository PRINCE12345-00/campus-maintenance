import { useState } from 'react'
import { FileText, FolderOpen, Search } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { getStudentPermissions } from '../../utils/studentRecords'

const permissionTypes = ['Educational', 'Cultural']

export default function StudentPermissionsPage() {
  const { permissions, setPermissions, user } = useAppContext()
  const studentPermissions = getStudentPermissions(permissions, user)
  const [type, setType] = useState('Educational')
  const [form, setForm] = useState({
    title: '',
    purpose: '',
    date: '',
    location: '',
    details: '',
  })
  const [errors, setErrors] = useState({})

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

  const handleSubmit = (event) => {
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
      status: 'Under Review',
      submittedBy: user?.name || 'Student',
      submittedById: user?.id,
      submittedByEmail: user?.email,
      faculty: 'Department Faculty',
      details: form.details || 'Permission request submitted for administrative review.'
    }

    setPermissions((prev) => [newPermission, ...prev])
    setForm({ title: '', purpose: '', date: '', location: '', details: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Permissions</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Educational & Cultural Requests</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Apply for permission</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Permission type</label>
              <div className="grid grid-cols-2 gap-3">
                {permissionTypes.map((item) => (
                  <button type="button" key={item} onClick={() => setType(item)} className={`rounded-xl border px-4 py-3 text-sm font-medium ${type === item ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Activity title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="Innovation Expo 2026" />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="State the objective and event significance" />
              {errors.purpose && <p className="mt-2 text-sm text-red-600">{errors.purpose}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" />
                {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="Main Auditorium" />
                {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Additional details</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500" placeholder="Event details, participant count, faculty support, transport plan" />
            </div>

            <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Submit request</button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Permission requests</h2>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
              <Search size={16} /> <span className="text-sm">Search</span>
            </div>
          </div>
          <div className="space-y-4">
            {studentPermissions.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">You have no permission requests yet.</p>
            )}
            {studentPermissions.map((permission) => (
              <div key={permission.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-600" />
                      <p className="font-semibold text-slate-800">{permission.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{permission.type} • {permission.location}</p>
                    <p className="mt-1 text-xs text-slate-500">{permission.date}</p>
                  </div>
                  <StatusBadge status={permission.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
