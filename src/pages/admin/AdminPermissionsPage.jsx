import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'

export default function AdminPermissionsPage() {
  const { permissions, setPermissions } = useAppContext()

  const updatePermission = (id, status) => {
    setPermissions((prev) => prev.map((permission) => permission.id === id ? { ...permission, status } : permission))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Permission review</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Educational & Cultural approvals</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-slate-900">{permission.title}</p>
                    <StatusBadge status={permission.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{permission.type} • {permission.location}</p>
                  <p className="mt-1 text-sm text-slate-500">Purpose: {permission.purpose}</p>
                  <p className="mt-1 text-sm text-slate-500">Submitted by: {permission.submittedBy}</p>
                </div>

                {permission.status === 'Under Review' && (
                  <div className="flex gap-3">
                    <button onClick={() => updatePermission(permission.id, 'Approved')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                      <Check size={16} /> Approve
                    </button>
                    <button onClick={() => updatePermission(permission.id, 'Rejected')} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
