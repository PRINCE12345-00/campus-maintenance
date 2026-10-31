export const statusColors = {
  Submitted: 'bg-slate-200 text-slate-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-800 text-white',
  'Under Review': 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
}

export const categoryOptions = [
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Damaged Furniture',
  'IT/Network',
  'Other',
]

export const campusLocations = [
  'Academic Block A',
  'Academic Block B',
  'Library',
  'Girls Hostel',
  'Boys Hostel',
  'Main Gate',
  'Computer Lab 3',
  'Cafeteria',
  'Sports Complex',
  'Administrative Block',
]

export const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')
