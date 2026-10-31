import { useAppContext } from '../../context/AppContext'

export default function StudentProfilePage() {
  const { profile, setProfile } = useAppContext()
  const displayName = profile.fullName || profile.name || 'Student'
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Student profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">{initials}</div>
            <div>
              <p className="text-xl font-bold text-slate-900">{displayName}</p>
              <p className="text-sm text-slate-500">{profile.department || 'Department not set'}{profile.batch ? ` • Batch ${profile.batch}` : ''}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">Email:</span> {profile.email}</p>
            <p><span className="font-medium text-slate-900">Phone:</span> {profile.phone}</p>
            <p><span className="font-medium text-slate-900">Hostel:</span> {profile.hostel}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Account settings</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input name="fullName" value={profile.fullName || profile.name || ''} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" value={profile.email || ''} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" value={profile.phone || ''} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Hostel</label>
              <input name="hostel" value={profile.hostel || ''} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="font-medium text-slate-700">Email notifications</span>
              <input type="checkbox" name="notificationsEnabled" checked={profile.notificationsEnabled ?? true} onChange={handleChange} className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="font-medium text-slate-700">Dark mode preview</span>
              <input type="checkbox" name="darkMode" checked={profile.darkMode ?? false} onChange={handleChange} className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
