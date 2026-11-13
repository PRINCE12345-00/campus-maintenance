import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { isEmailConfigured, notifyStudent } from './notifications.js'

const app = express()
const port = process.env.PORT || 5000
const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'

app.use(cors())
app.use(express.json())

const demoUsers = [
  {
    id: 'STU-202401',
    name: 'Aarav Sharma',
    email: 'aarav@student.dcrust.in',
    role: 'student',
    department: 'Computer Science & Engineering',
    batch: '2026',
    phone: '+91 98765 43210',
    hostel: 'Boys Hostel Block A',
    password: 'student123',
  },
  {
    id: 'ADM-9001',
    name: 'Prince Chahal',
    email: 'chahalprince0481@gmail.com',
    role: 'admin',
    department: 'Administrative Office',
    phone: '',
    password: 'prince@123',
  },
  {
    id: 'HOD-CSE-01',
    name: 'CSE Department Head',
    email: 'hod.cse@dcrust.in',
    role: 'department_head',
    department: 'Computer Science & Engineering',
    password: 'hod12345',
  },
  { id: 'COORD-CULT-01', name: 'Cultural Coordinator', email: 'cultural.coordinator@dcrust.in', role: 'cultural_coordinator', department: 'Student Affairs', password: 'culture123' },
  { id: 'COORD-TECH-01', name: 'Technical Coordinator', email: 'technical.coordinator@dcrust.in', role: 'technical_coordinator', department: 'Student Affairs', password: 'tech12345' },
  { id: 'DSW-01', name: 'Dean of Student Welfare', email: 'dsw@dcrust.in', role: 'dsw', department: 'Student Welfare', password: 'dsw12345' },
  { id: 'REG-01', name: 'Registrar', email: 'registrar@dcrust.in', role: 'registrar', department: 'Registrar Office', password: 'registrar123' },
  { id: 'VC-01', name: 'Vice Chancellor', email: 'vc@dcrust.in', role: 'vice_chancellor', department: 'Vice Chancellor Office', password: 'vc123456' },
]

const complaints = [
  {
    id: 'CMP-1001',
    category: 'Electrical',
    location: 'Academic Block A',
    title: 'Street light flickering near main gate',
    description: 'The lights near the main gate are flickering intermittently after 8 PM and create unsafe conditions for students returning late.',
    status: 'Assigned',
    priority: 'High',
    submittedBy: 'Aarav Sharma',
    assignedTo: 'Maintenance Team',
    submissionDate: '2026-10-02',
    lastUpdated: '2026-10-03',
    attachments: ['gate-light.png'],
    timeline: [
      { status: 'Submitted', date: '2026-10-02', note: 'Complaint filed by student.' },
      { status: 'Assigned', date: '2026-10-03', note: 'Assigned to electrical team.' },
    ],
    rating: 4,
    feedback: 'Fast response and good repair.',
  },
  {
    id: 'CMP-1002',
    category: 'Plumbing',
    location: 'Girls Hostel',
    title: 'Water supply issue in second floor washroom',
    description: 'The tap pressure is weak and there is water leakage from the supply pipe during early morning hours.',
    status: 'In Progress',
    priority: 'Medium',
    submittedBy: 'Aarav Sharma',
    assignedTo: 'Plumbing Unit',
    submissionDate: '2026-09-28',
    lastUpdated: '2026-10-04',
    attachments: ['washroom-leak.jpg'],
    timeline: [
      { status: 'Submitted', date: '2026-09-28', note: 'Complaint filed.' },
      { status: 'Assigned', date: '2026-09-29', note: 'Assigned to plumber.' },
      { status: 'In Progress', date: '2026-10-04', note: 'Pipe replacement in progress.' },
    ],
    rating: null,
    feedback: '',
  },
]

const permissions = [
  {
    id: 'PER-2001',
    type: 'Educational',
    title: 'Industrial Visit to NHPC',
    purpose: 'Field exposure and practical learning for renewable energy systems.',
    date: '2026-10-18',
    location: 'NHPC, Yamuna Nagar',
    status: 'Under Review',
    submittedBy: 'Aarav Sharma',
    faculty: 'Dr. R. Kapoor',
    details: '12 students from CSE 6th semester will participate in the visit with faculty escort.',
  },
  {
    id: 'PER-2002',
    type: 'Cultural',
    title: 'Inter-College Dance Festival',
    purpose: 'Participation in university cultural fest representing the department.',
    date: '2026-11-02',
    location: 'Main Auditorium',
    status: 'Approved',
    submittedBy: 'Aarav Sharma',
    faculty: 'Prof. S. Verma',
    details: 'Department team of 8 students selected for performance and rehearsal.',
  },
]

const notifications = [
  {
    id: 'NOT-1',
    title: 'Complaint assigned',
    message: 'Your electrical complaint at Academic Block A has been assigned to the maintenance team.',
    type: 'complaint',
    isRead: false,
    createdAt: '2026-10-03T09:15:00',
  },
  {
    id: 'NOT-2',
    title: 'Permission approved',
    message: 'Your cultural permission application has been approved by the administration.',
    type: 'permission',
    isRead: true,
    createdAt: '2026-10-02T16:45:00',
  },
]

const permissionStages = (type) => [
  'Department Head',
  type === 'Cultural' ? 'Cultural Coordinator' : 'Technical Coordinator',
  'DSW',
  'Registrar',
  'Vice Chancellor',
]

const buildApprovalChain = (type) => permissionStages(type).map((stage, index) => ({
  stage,
  status: index === 0 ? 'Pending' : 'Waiting',
  decidedAt: null,
  comment: '',
}))

const ensureApprovalWorkflow = (permission) => {
  if (!Array.isArray(permission.approvalChain)) {
    permission.approvalChain = buildApprovalChain(permission.type)
    if (permission.status === 'Approved') {
      permission.approvalChain.forEach((stage) => { stage.status = 'Approved' })
      permission.currentStage = null
    } else if (permission.status === 'Rejected') {
      permission.approvalChain[0].status = 'Rejected'
      permission.currentStage = null
    } else {
      permission.approvalChain[0].status = 'Pending'
      permission.currentStage = permission.approvalChain[0].stage
      permission.status = 'Pending Approval'
    }
  }
  return permission
}

permissions.forEach(ensureApprovalWorkflow)

const createNotification = (type, title, message) => ({
  id: `NOT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  message,
  type,
  isRead: false,
  createdAt: new Date().toISOString(),
})

const getSafeUser = (user) => {
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Campus API is running', emailConfigured: isEmailConfigured })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = demoUsers.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === String(password),
  )

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  return res.json({
    message: 'Login successful',
    user: getSafeUser(user),
  })
})

app.post('/api/auth/register', (req, res) => {
  const { name, rollNumber, email, department, password } = req.body || {}

  if (!name || !rollNumber || !email || !department || !password) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  if (demoUsers.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  const newUser = {
    id: String(rollNumber).trim(),
    rollNumber: String(rollNumber).trim(),
    name: String(name).trim(),
    email: normalizedEmail,
    role: 'student',
    department: String(department).trim(),
    batch: '2026',
    password: String(password),
  }

  demoUsers.push(newUser)

  return res.status(201).json({
    message: 'Registration successful.',
    user: getSafeUser(newUser),
  })
})

app.get('/api/analytics', (req, res) => {
  const countBy = (key) => Object.entries(complaints.reduce((acc, item) => {
    const value = item[key] || 'Unspecified'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const monthlyMap = complaints.reduce((acc, item) => {
    const date = new Date(item.submissionDate || item.createdAt || '')
    if (!Number.isNaN(date.getTime())) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[key] = (acc[key] || 0) + 1
    }
    return acc
  }, {})
  const monthlyTrend = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).map(([month, complaintsCount]) => ({ month, complaints: complaintsCount }))
  const resolved = complaints.filter((item) => ['Resolved', 'Closed'].includes(item.status))
  const resolutionDays = resolved.map((item) => {
    const start = new Date(item.submissionDate)
    const end = new Date(item.lastUpdated || item.submissionDate)
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) ? Math.max(0, (end - start) / 86400000) : null
  }).filter((value) => value !== null)
  const averageResolutionTime = resolutionDays.length
    ? Number((resolutionDays.reduce((sum, value) => sum + value, 0) / resolutionDays.length).toFixed(1))
    : null

  const categoryDistribution = countBy('category')
  const locations = countBy('location').map(({ name, value }) => ({ name, complaints: value }))
  const priorityDistribution = countBy('priority')
  const statusSummary = countBy('status')
  const recurringIssues = categoryDistribution.filter((item) => item.value > 1).map((item) => item.name)

  res.json({
    source: 'live-in-memory-complaints',
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((item) => ['Submitted', 'Assigned', 'In Progress'].includes(item.status)).length,
    resolvedComplaints: resolved.length,
    categoryDistribution,
    locations,
    monthlyTrend,
    priorityDistribution,
    statusSummary,
    averageResolutionTime,
    recurringIssues,
    note: 'Analytics are calculated from the complaints currently held by the Node.js server. The current demo backend stores records in memory, so data resets when the server restarts.',
  })
})

app.get('/api/complaints', (req, res) => {
  res.json(complaints)
})

app.post('/api/complaints', async (req, res) => {
  const complaint = req.body
    let mlPrediction = null

  try {
    const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: complaint.description,
        location: complaint.location,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`)
    }

    mlPrediction = await mlResponse.json()
  } catch (error) {
    console.error('ML prediction failed:', error.message)
  }

  if (!complaint?.title || !complaint?.description || !complaint?.location) {
    return res.status(400).json({ message: 'Complaint title, description, and location are required.' })
  }

  const newComplaint = {
    ...complaint,
      category: mlPrediction?.success
    ? mlPrediction.category
    : (complaint.category || 'Uncategorized'),

  priority: mlPrediction?.success
    ? mlPrediction.priority
    : (complaint.priority || 'Medium'),

  mlPrediction: mlPrediction ? {
    categoryConfidence: mlPrediction.category_confidence,
    priorityConfidence: mlPrediction.priority_confidence,
    manualReviewRequired: mlPrediction.manual_review_required,
  } : null,
    id: complaint.id || `CMP-${Date.now()}`,
    status: complaint.status || 'Submitted',
    submittedBy: complaint.submittedBy || 'Student',
    assignedTo: complaint.assignedTo || 'Maintenance Cell',
    submissionDate: complaint.submissionDate || new Date().toISOString().slice(0, 10),
    lastUpdated: complaint.lastUpdated || new Date().toISOString().slice(0, 10),
    timeline: complaint.timeline || [{ status: 'Submitted', date: new Date().toISOString().slice(0, 10), note: `Complaint filed by student and routed to ${complaint.destination || complaint.department || 'Department'}.` }],
    attachments: complaint.attachments || [],
    rating: complaint.rating ?? null,
    feedback: complaint.feedback || '',
    destination: complaint.destination || complaint.department || 'Department',
  }

  complaints.unshift(newComplaint)

  const submittedEmail = String(complaint.submittedByEmail || '').trim()
  const student = demoUsers.find((entry) => entry.email?.toLowerCase() === submittedEmail.toLowerCase())
    || demoUsers.find((entry) => entry.name === complaint.submittedBy)

  const notificationResults = await notifyStudent({
      student: { ...student, name: student?.name || complaint.submittedBy || 'Student', email: submittedEmail || student?.email },
      type: 'Complaint',
      title: 'Complaint Submitted',
      message: `Your complaint "${newComplaint.title}" has been received and is now under review.`,
    })
  if (student || submittedEmail) {
    notifications.unshift(createNotification('complaint', 'Complaint submitted', `Your complaint "${newComplaint.title}" has been received and is now under review.`))
  }

  return res.status(201).json({ complaint: newComplaint, notifications: notificationResults })
})

app.patch('/api/complaints/:id/status', async (req, res) => {
  const { id } = req.params
  const { status, reviewerRole, comment = '' } = req.body || {}
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' })
  }

  if (reviewerRole === 'department_head' && complaint.destination && !complaint.destination.toLowerCase().includes('department')) {
    return res.status(403).json({ message: 'This complaint is routed to another university office, not a department.' })
  }

  complaint.status = status || complaint.status
  complaint.lastUpdated = new Date().toISOString().slice(0, 10)
  complaint.timeline = [
    ...(complaint.timeline || []),
    { status: complaint.status, date: new Date().toISOString().slice(0, 10), note: String(comment).trim() || `Status updated to ${complaint.status}.` },
  ]

  const student = demoUsers.find((entry) => entry.name === complaint.submittedBy)
    || demoUsers.find((entry) => entry.email?.toLowerCase() === String(complaint.submittedByEmail || '').toLowerCase())

  if (student) {
    notifications.unshift(createNotification('complaint', `Complaint ${complaint.status}`, `Your complaint "${complaint.title}" is now marked as ${complaint.status}.`))
    await notifyStudent({
      student,
      type: 'Complaint Update',
      title: `Complaint ${complaint.status}`,
      message: `Your complaint "${complaint.title}" is now marked as ${complaint.status}.`,
    })
  }

  return res.json(complaint)
})

app.get('/api/permissions', (req, res) => {
  res.json(permissions)
})

app.post('/api/permissions', async (req, res) => {
  const permission = req.body

  if (!permission?.title || !permission?.purpose || !permission?.date || !permission?.location) {
    return res.status(400).json({ message: 'Permission title, purpose, date, and location are required.' })
  }

  const newPermission = {
    ...permission,
    id: permission.id || `PER-${Date.now()}`,
    status: 'Pending Approval',
    approvalChain: buildApprovalChain(permission.type),
    currentStage: 'Department Head',
    approvalHistory: [{ stage: 'Submission', status: 'Submitted', date: new Date().toISOString(), note: 'Request submitted for approval.' }],
    submittedBy: permission.submittedBy || 'Student',
    department: permission.department || '',
    faculty: permission.faculty || 'Department Faculty',
    details: permission.details || 'Permission request submitted for administrative review.',
  }

  permissions.unshift(newPermission)

  const student = demoUsers.find((entry) => entry.email?.toLowerCase() === String(permission.submittedByEmail || '').toLowerCase())
    || demoUsers.find((entry) => entry.name === permission.submittedBy)

  if (student) {
    notifications.unshift(createNotification('permission', 'Permission request submitted', `Your permission request for "${newPermission.title}" has been submitted for review.`))
    await notifyStudent({
      student,
      type: 'Permission',
      title: 'Permission Request Submitted',
      message: `Your permission request for "${newPermission.title}" has been submitted for review.`,
    })
  }

  return res.status(201).json(newPermission)
})

app.patch('/api/permissions/:id/status', async (req, res) => {
  const { id } = req.params
  const { status, decision, comment = '', reviewerRole = 'admin' } = req.body || {}
  const permission = permissions.find((item) => item.id === id)

  if (!permission) {
    return res.status(404).json({ message: 'Permission request not found.' })
  }

  ensureApprovalWorkflow(permission)
  const reviewDecision = decision || (status === 'Approved' ? 'approve' : status === 'Rejected' ? 'reject' : null)
  if (!['approve', 'reject', 'return'].includes(reviewDecision)) {
    return res.status(400).json({ message: 'Choose approve, reject, or return for the current stage.' })
  }
  if (permission.status === 'Approved' || permission.status === 'Rejected') {
    return res.status(409).json({ message: 'This permission workflow is already complete.' })
  }

  const currentIndex = permission.approvalChain.findIndex((stage) => stage.stage === permission.currentStage)
  const current = permission.approvalChain[currentIndex]
  if (!current || current.status !== 'Pending') {
    return res.status(409).json({ message: 'No approval stage is currently awaiting review.' })
  }
  if (current.stage === 'Department Head' && reviewerRole !== 'department_head') {
    return res.status(403).json({ message: 'This request must be reviewed by the Department Head first.' })
  }
  const expectedReviewer = {
    'Cultural Coordinator': 'cultural_coordinator',
    'Technical Coordinator': 'technical_coordinator',
    DSW: 'dsw',
    Registrar: 'registrar',
    'Vice Chancellor': 'vice_chancellor',
  }[current.stage]
  if (current.stage !== 'Department Head' && reviewerRole !== expectedReviewer) {
    return res.status(403).json({ message: `This request is awaiting ${current.stage} review.` })
  }
  if (current.stage === 'Cultural Coordinator' && permission.type !== 'Cultural') {
    return res.status(403).json({ message: 'Only cultural requests can be reviewed by the Cultural Coordinator.' })
  }
  if (current.stage === 'Technical Coordinator' && permission.type === 'Cultural') {
    return res.status(403).json({ message: 'Cultural requests must be reviewed by the Cultural Coordinator.' })
  }
  if (['return', 'reject'].includes(reviewDecision) && !String(comment).trim()) {
    return res.status(400).json({ message: 'Add a comment explaining the requested changes or rejection.' })
  }

  const now = new Date().toISOString()
  current.status = reviewDecision === 'approve' ? 'Approved' : reviewDecision === 'return' ? 'Returned' : 'Rejected'
  current.decidedAt = now
  current.comment = String(comment).trim()
  permission.approvalHistory = [
    ...(permission.approvalHistory || []),
    { stage: current.stage, status: current.status, date: now, note: current.comment },
  ]

  if (reviewDecision === 'return') {
    const previous = permission.approvalChain[currentIndex - 1]
    if (previous) {
      previous.status = 'Pending'
      previous.decidedAt = null
      permission.currentStage = previous.stage
      permission.status = 'Pending Approval'
      current.status = 'Returned'
      permission.approvalHistory.push({ stage: previous.stage, status: 'Returned for revision', date: now, note: current.comment, returnedBy: current.stage })
    } else {
      permission.currentStage = null
      permission.status = 'Changes Requested'
    }
  } else if (reviewDecision === 'reject') {
    permission.status = 'Rejected'
    permission.currentStage = null
  } else {
    const next = permission.approvalChain[currentIndex + 1]
    if (next) {
      next.status = 'Pending'
      permission.currentStage = next.stage
      permission.status = 'Pending Approval'
    } else {
      permission.currentStage = null
      permission.status = 'Approved'
    }
  }

  const student = demoUsers.find((entry) => entry.name === permission.submittedBy)
    || demoUsers.find((entry) => entry.email?.toLowerCase() === String(permission.submittedByEmail || '').toLowerCase())

  if (student) {
    const statusMessage = reviewDecision === 'return'
      ? `Your permission request for "${permission.title}" needs changes. ${permission.currentStage ? `It has been returned to ${permission.currentStage}.` : 'Please revise it and contact your Department Head.'} Reviewer note: ${current.comment}`
      : `Your permission request for "${permission.title}" was ${current.status.toLowerCase()} at ${current.stage}.${permission.currentStage ? ` It is now with ${permission.currentStage}.` : ` Final status: ${permission.status}.`}${current.comment ? ` Reviewer note: ${current.comment}` : ''}`
    notifications.unshift(createNotification('permission', `Permission update: ${reviewDecision === 'return' ? 'Changes requested' : current.status}`, statusMessage))
    await notifyStudent({
      student,
      type: 'Permission Update',
      title: `Permission update: ${reviewDecision === 'return' ? 'Changes requested' : current.status}`,
      message: statusMessage,
    })
  }

  return res.json(permission)
})

app.patch('/api/permissions/:id/resubmit', (req, res) => {
  const permission = permissions.find((item) => item.id === req.params.id)
  if (!permission) return res.status(404).json({ message: 'Permission request not found.' })
  if (permission.status !== 'Changes Requested' || permission.currentStage !== null) {
    return res.status(409).json({ message: 'This request is not waiting for student changes.' })
  }

  const studentResponse = String(req.body?.studentResponse || '').trim()
  if (!studentResponse) return res.status(400).json({ message: 'Add a response describing the changes or clarification.' })

  const now = new Date().toISOString()
  permission.details = req.body?.details ? String(req.body.details).trim() : permission.details
  permission.studentResponse = studentResponse
  permission.status = 'Pending Approval'
  permission.currentStage = 'Department Head'
  permission.approvalChain = buildApprovalChain(permission.type)
  permission.approvalHistory = [
    ...(permission.approvalHistory || []),
    { stage: 'Student', status: 'Resubmitted', date: now, note: studentResponse },
  ]
  return res.json(permission)
})

app.get('/api/notifications', (req, res) => {
  res.json(notifications)
})

app.listen(port, () => {
  console.log(`Campus backend running on http://localhost:${port}`)
})
