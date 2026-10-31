import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'

export default function PermissionReviewPage() {
  const { id } = useParams()
  const { permissions } = useAppContext()
  const permission = permissions.find((item) => item.id === id)

  if (!permission) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-soft">Permission request not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Permission review</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{permission.title}</h1>
          </div>
          <StatusBadge status={permission.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Type</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.type}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Date</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.date}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Faculty</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.faculty}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Purpose</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{permission.purpose}</p>
        </div>
      </div>
    </div>
  )
}
