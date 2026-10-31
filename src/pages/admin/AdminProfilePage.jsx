export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin profile</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">PC</div>
          <div>
            <p className="text-xl font-bold text-slate-900">Prince Chahal</p>
            <p className="text-sm text-slate-500">Administrative Office</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 font-medium text-slate-800">chahalprince0481@gmail.com</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-2 font-medium text-slate-800">—</p>
          </div>
        </div>
      </div>
    </div>
  )
}
