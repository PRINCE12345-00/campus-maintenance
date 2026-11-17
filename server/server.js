
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { isEmailConfigured, notifyStudent, sendEmailNotification } from './notifications.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function loadJson(fileName, fallback) {
  const filePath = path.join(dataDir, fileName)
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8')
  } catch (err) {
    console.error(`Error loading ${fileName}:`, err.message)
  }
  return fallback
}

function saveJson(fileName, data) {
  const filePath = path.join(dataDir, fileName)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error(`Error saving ${fileName}:`, err.message)
  }
}

const app = express()
const port = process.env.PORT || 5000
const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'

app.use(cors())
app.use(express.json())

const initialDemoUsers = [
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

const initialComplaints = [
  {
    id: 'CMP-1001',
    category: 'Electrical',
    location: 'Academic Block A',
    title: 'Street light flickering near main gate',
    description: 'The lights near the main gate are flickering intermittently after 8 PM and create unsafe conditions for students returning late.',
    status: 'Assigned',
    progress: 25,
    priority: 'High',
    submittedBy: 'Aarav Sharma',
    submittedByEmail: 'aarav@student.dcrust.in',
    assignedTo: 'Maintenance Team',
    submissionDate: '2026-10-02',
    lastUpdated: '2026-10-03',
    attachments: ['gate-light.png'],
    timeline: [
      { status: 'Submitted', progress: 10, date: '2026-10-02', note: 'Complaint filed by student.' },
      { status: 'Assigned', progress: 25, date: '2026-10-03', note: 'Assigned to electrical team.' },
    ],
    emailUpdates: [
      {
        id: 'EML-1001-1',
        date: '2026-10-03T09:30:00Z',
        sender: 'Admin Office (Prince Chahal)',
        recipient: 'aarav@student.dcrust.in',
        subject: '[Progress: 25% Assigned] Street light flickering near main gate',
        message: 'Dear Aarav, your complaint has been reviewed and assigned to the campus Electrical Maintenance Unit. A technician will inspect the main gate light today.',
        status: 'Assigned',
        progress: 25,
        delivered: true,
        mode: 'email',
      },
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
    progress: 60,
    priority: 'Medium',
    submittedBy: 'Aarav Sharma',
    submittedByEmail: 'aarav@student.dcrust.in',
    assignedTo: 'Plumbing Unit',
    submissionDate: '2026-09-28',
    lastUpdated: '2026-10-04',
    attachments: ['washroom-leak.jpg'],
    timeline: [
      { status: 'Submitted', progress: 10, date: '2026-09-28', note: 'Complaint filed.' },
      { status: 'Assigned', progress: 25, date: '2026-09-29', note: 'Assigned to plumber.' },
      { status: 'In Progress', progress: 60, date: '2026-10-04', note: 'Pipe replacement in progress.' },
    ],
    emailUpdates: [
      {
        id: 'EML-1002-1',
        date: '2026-09-29T10:15:00Z',
        sender: 'Admin Office',
        recipient: 'aarav@student.dcrust.in',
        subject: '[Update: 25% Assigned] Water supply issue in second floor washroom',
        message: 'Your complaint has been acknowledged and assigned to the plumbing team.',
        status: 'Assigned',
        progress: 25,
        delivered: true,
        mode: 'email',
      },
      {
        id: 'EML-1002-2',
        date: '2026-10-04T11:40:00Z',
        sender: 'Admin Office (Prince Chahal)',
        recipient: 'aarav@student.dcrust.in',
        subject: '[Progress: 60% In Progress] Pipe replacement under way',
        message: 'Dear Aarav, the plumber has replaced the damaged joint and is currently fixing the main valve. We expect full resolution by evening.',
        status: 'In Progress',
        progress: 60,
        delivered: true,
        mode: 'email',
      },
    ],
    rating: null,
    feedback: '',
  },
]

const initialPermissions = [
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

const initialNotifications = [
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

// Load persistent collections from disk
const demoUsers = loadJson('users.json', initialDemoUsers)
const complaints = loadJson('complaints.json', initialComplaints)
const permissions = loadJson('permissions.json', initialPermissions)
const notifications = loadJson('notifications.json', initialNotifications)

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
  saveJson('users.json', demoUsers)

  return res.status(201).json({
    message: 'Registration successful.',
    user: getSafeUser(newUser),
  })
})

// User Management Endpoints
app.get('/api/users', (req, res) => {
  const usersWithStats = demoUsers.map((user) => {
    const userEmail = (user.email || '').toLowerCase()
    const userId = (user.id || user.rollNumber || '').toLowerCase()
    const userName = (user.name || '').toLowerCase()

    const userComplaints = complaints.filter((c) => {
      const cEmail = (c.submittedByEmail || '').toLowerCase()
      const cName = (c.submittedBy || '').toLowerCase()
      const cId = (c.submittedById || '').toLowerCase()
      return (userEmail && cEmail === userEmail) || (userId && cId === userId) || (userName && cName === userName)
    })

    const userPermissions = permissions.filter((p) => {
      const pEmail = (p.submittedByEmail || '').toLowerCase()
      const pName = (p.submittedBy || '').toLowerCase()
      const pId = (p.submittedById || '').toLowerCase()
      return (userEmail && pEmail === userEmail) || (userId && pId === userId) || (userName && pName === userName)
    })

    return {
      ...getSafeUser(user),
      status: user.status || 'Active',
      hostel: user.hostel || 'Hostel Block A',
      batch: user.batch || '2026',
      complaintsCount: userComplaints.length,
      permissionsCount: userPermissions.length,
      createdAt: user.createdAt || '2026-08-01T10:00:00.000Z',
    }
  })

  res.json(usersWithStats)
})

app.post('/api/users', (req, res) => {
  const { name, rollNumber, email, role = 'student', department, batch = '2026', hostel = '', phone = '', password } = req.body || {}
  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Name, email, and department are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  if (demoUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'User with this email already exists.' })
  }

  const newUser = {
    id: rollNumber ? String(rollNumber).trim() : `USR-${Date.now()}`,
    rollNumber: rollNumber ? String(rollNumber).trim() : '',
    name: String(name).trim(),
    email: normalizedEmail,
    role: String(role).trim(),
    department: String(department).trim(),
    batch: String(batch).trim(),
    hostel: String(hostel).trim() || 'Hostel Block A',
    phone: String(phone).trim(),
    password: password ? String(password) : 'welcome123',
    status: 'Active',
    createdAt: new Date().toISOString(),
  }

  demoUsers.unshift(newUser)
  saveJson('users.json', demoUsers)

  res.status(201).json({
    message: 'User created successfully',
    user: getSafeUser(newUser),
  })
})

app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params
  const { status, hostel, department, phone, password, role, name, oldPassword } = req.body || {}
  const target = String(id).toLowerCase()
  const user = demoUsers.find((u) => String(u.id || '').toLowerCase() === target || String(u.rollNumber || '').toLowerCase() === target || String(u.email || '').toLowerCase() === target)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (oldPassword && user.password && user.password !== oldPassword) {
    return res.status(400).json({ message: 'Current password does not match.' })
  }

  if (name) user.name = name
  if (status) user.status = status
  if (hostel !== undefined) user.hostel = hostel
  if (department) user.department = department
  if (phone !== undefined) user.phone = phone
  if (role) user.role = role
  if (password) user.password = String(password)

  saveJson('users.json', demoUsers)
  res.json({ message: 'Profile updated successfully', user: getSafeUser(user) })
})

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params
  const index = demoUsers.findIndex((u) => u.id === id || u.rollNumber === id)
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' })
  }
  const removed = demoUsers.splice(index, 1)[0]
  saveJson('users.json', demoUsers)
  res.json({ message: `User ${removed.name} deleted successfully` })
})

app.post('/api/users/broadcast', (req, res) => {
  const { title, message } = req.body || {}
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' })
  }

  const broadcastNotif = {
    id: `NOT-BC-${Date.now()}`,
    title: `📢 Campus Announcement: ${title}`,
    message: String(message).trim(),
    type: 'announcement',
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  notifications.unshift(broadcastNotif)
  saveJson('notifications.json', notifications)

  res.json({ message: 'Broadcast announcement published successfully', notification: broadcastNotif })
})

app.post('/api/users/:id/message', async (req, res) => {
  const { id } = req.params
  const { subject, message } = req.body || {}
  const targetUser = demoUsers.find((u) => u.id === id || u.rollNumber === id)
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' })
  }

  const finalSubject = subject || 'Notice from Administration'
  const notifObj = createNotification('direct_message', finalSubject, message)
  notifObj.userEmail = targetUser.email
  notifications.unshift(notifObj)
  saveJson('notifications.json', notifications)

  await notifyStudent({
    student: targetUser,
    type: 'Administrative Notice',
    title: finalSubject,
    message: `${message}\n\nFrom: Campus Maintenance Cell & Administration`,
  })

  res.json({ message: `Message sent to ${targetUser.name} (${targetUser.email})` })
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

  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, complaintsCount]) => ({ month, complaints: complaintsCount }))

  const resolved = complaints.filter((item) => ['Resolved', 'Closed'].includes(item.status))

  const resolutionDays = resolved.map((item) => {
    const start = new Date(item.submissionDate)
    const end = new Date(item.lastUpdated || item.submissionDate)
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? Math.max(0, (end - start) / 86400000)
      : null
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
    source: 'persistent-campus-db',
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
    mlMetrics,
    note: 'Live analytics dynamically synchronized with ML Service and persistent storage.',
  })
})

// Phase 7: Predictive Maintenance API
app.get('/api/analytics/predictive-maintenance', async (req, res) => {
  try {
    const mlRes = await fetch(`${mlServiceUrl}/analytics/predictive-maintenance`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!mlRes.ok) throw new Error(`ML service returned status ${mlRes.status}`)
    const data = await mlRes.json()
    return res.json(data)
  } catch (error) {
    return res.status(503).json({
      message: 'Predictive maintenance service unavailable. Ensure Python ML service is running on port 8000.',
      error: error.message,
    })
  }
})

// Phase 10: RAG Campus AI Chatbot API
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body || {}
    if (!query) return res.status(400).json({ message: 'Query is required.' })

    const mlRes = await fetch(`${mlServiceUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, live_complaints: complaints }),
      signal: AbortSignal.timeout(10000),
    })
    if (!mlRes.ok) throw new Error(`Chat service returned ${mlRes.status}`)
    const data = await mlRes.json()
    return res.json(data)
  } catch (error) {
    return res.status(503).json({
      answer: 'The Campus AI Assistant service is temporarily offline. Please verify that the Python ML service is running on port 8000.',
      source: 'System Fallback',
      confidence: 0.0,
    })
  }
})

// Phase 11: Computer Vision Analysis API
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const { image_base64, filename } = req.body || {}
    if (!image_base64) return res.status(400).json({ message: 'image_base64 is required.' })

    const mlRes = await fetch(`${mlServiceUrl}/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64, filename: filename || 'upload.jpg' }),
      signal: AbortSignal.timeout(10000),
    })
    if (!mlRes.ok) throw new Error(`Vision service returned ${mlRes.status}`)
    const data = await mlRes.json()
    return res.json(data)
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: `Vision service error: ${error.message}`,
    })
  }
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
        title: complaint.title || '',
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
    return res.status(400).json({
      message: 'Complaint title, description, and location are required.',
    })
  }

  const categoryFinal = mlPrediction?.success
    ? mlPrediction.category
    : (complaint.category || 'Other')

  const priorityFinal = mlPrediction?.success
    ? mlPrediction.priority
    : (complaint.priority || 'Medium')

  const activePrediction = mlPrediction?.success ? {
    isAvailable: true,
    categoryConfidence: mlPrediction.category_confidence,
    priorityConfidence: mlPrediction.priority_confidence,
    manualReviewRequired: mlPrediction.manual_review_required,
    estimatedResolutionDays: mlPrediction.estimated_resolution_days,
    expectedResolutionDate: mlPrediction.expected_resolution_date || null,
    delayRisk: mlPrediction.delay_risk || 'On Track',
    explanation: mlPrediction.explanation || null,
    modelVersion: mlPrediction.model_version || '2.0.0',
  } : {
    isAvailable: false,
    categoryConfidence: null,
    priorityConfidence: null,
    manualReviewRequired: true,
    estimatedResolutionDays: null,
    expectedResolutionDate: null,
    delayRisk: 'Manual Review Required',
    explanation: 'ML prediction unavailable at submission time. Queued for manual triage.',
    modelVersion: null,
  }

  const newComplaint = {
    ...complaint,
    category: categoryFinal,
    priority: priorityFinal,
    mlPrediction: activePrediction,
    id: complaint.id || `CMP-${Date.now()}`,
    status: complaint.status || 'Submitted',
    progress: Number(complaint.progress) || 10,
    submittedBy: complaint.submittedBy || 'Student',
    submittedByEmail: complaint.submittedByEmail || 'aarav@student.dcrust.in',
    assignedTo: complaint.assignedTo || 'Maintenance Cell',
    submissionDate: complaint.submissionDate || new Date().toISOString().slice(0, 10),
    lastUpdated: complaint.lastUpdated || new Date().toISOString().slice(0, 10),
    timeline: complaint.timeline || [{ status: 'Submitted', progress: 10, date: new Date().toISOString().slice(0, 10), note: `Complaint filed by student and routed to ${complaint.destination || complaint.department || 'Department'}.` }],
    evidenceStatus: complaint.evidenceStatus || (complaint.attachments?.length ? 'Pending Verification' : 'No Evidence'),
    emailUpdates: complaint.emailUpdates || [],
    attachments: complaint.attachments || [],
    rating: complaint.rating ?? null,
    feedback: complaint.feedback || '',
    destination: complaint.destination || complaint.department || 'Department',
  }

  complaints.unshift(newComplaint)
  saveJson('complaints.json', complaints)

  const submittedEmail = String(
    complaint.submittedByEmail || newComplaint.submittedByEmail || '',
  ).trim()

  const student = demoUsers.find(
    (entry) => entry.email?.toLowerCase() === submittedEmail.toLowerCase(),
  ) || demoUsers.find((entry) => entry.name === complaint.submittedBy)

  const notificationResults = await notifyStudent({
    student: { ...student, name: student?.name || complaint.submittedBy || 'Student', email: submittedEmail || student?.email },
    type: 'Complaint',
    title: 'Complaint Submitted',
    message: `Your complaint "${newComplaint.title}" has been received and is now under review. Initial progress: 10%.`,
  })
  if (student || submittedEmail) {
    notifications.unshift(createNotification('complaint', 'Complaint submitted', `Your complaint "${newComplaint.title}" has been received and is now under review.`))
    saveJson('notifications.json', notifications)
  }

  return res.status(201).json({
    complaint: newComplaint,
    notifications: notificationResults,
  })
})

app.patch('/api/complaints/:id/status', async (req, res) => {
  const { id } = req.params
  const {
    status,
    reviewerRole = 'admin',
    comment = '',
    progress,
    emailSubject,
    emailMessage,
    sendEmail = true,
  } = req.body || {}

  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' })
  }

  if (reviewerRole === 'department_head' && complaint.destination && !complaint.destination.toLowerCase().includes('department')) {
    return res.status(403).json({ message: 'This complaint is routed to another university office, not a department.' })
  }

  if (status) {
    complaint.status = status
  }

  // Derive progress
  if (progress !== undefined && progress !== null && !Number.isNaN(Number(progress))) {
    complaint.progress = Math.min(100, Math.max(0, Number(progress)))
  } else if (status) {
    if (status === 'Resolved' || status === 'Closed') {
      complaint.progress = 100
    } else if (status === 'In Progress' && (!complaint.progress || complaint.progress < 50)) {
      complaint.progress = 50
    } else if (status === 'Assigned' && (!complaint.progress || complaint.progress < 25)) {
      complaint.progress = 25
    } else if (status === 'Submitted' && !complaint.progress) {
      complaint.progress = 10
    }
  }

  complaint.lastUpdated = new Date().toISOString().slice(0, 10)
  complaint.timeline = complaint.timeline || []
  complaint.emailUpdates = complaint.emailUpdates || []

  const student = demoUsers.find((entry) => entry.name === complaint.submittedBy)
    || demoUsers.find((entry) => entry.email?.toLowerCase() === String(complaint.submittedByEmail || '').toLowerCase())

  const studentEmail = complaint.submittedByEmail || student?.email || 'aarav@student.dcrust.in'

  const finalSubject = emailSubject || `[Progress: ${complaint.progress}% - ${complaint.status}] ${complaint.title}`
  const finalMessage = String(emailMessage || comment || `Status updated to ${complaint.status}. Progress is now ${complaint.progress}%.`).trim()

  let emailResult = { sent: false, mode: 'skipped' }

  if (sendEmail) {
    emailResult = await notifyStudent({
      student: {
        ...student,
        name: student?.name || complaint.submittedBy || 'Student',
        email: studentEmail,
        phone: student?.phone,
      },
      type: `Complaint Progress (${complaint.progress}%)`,
      title: finalSubject,
      message: `${finalMessage}\n\nComplaint ID: ${complaint.id}\nStatus: ${complaint.status}\nProgress: ${complaint.progress}%\nLocation: ${complaint.location}`,
    })
  }

  // Record official email communication
  const emailRecord = {
    id: `EML-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    date: new Date().toISOString(),
    sender: reviewerRole === 'admin' ? 'Campus Admin (Prince Chahal)' : `${reviewerRole} Office`,
    recipient: studentEmail,
    subject: finalSubject,
    message: finalMessage,
    status: complaint.status,
    progress: complaint.progress,
    delivered: Boolean(emailResult?.sent || emailResult?.mode === 'dry-run'),
    mode: emailResult?.mode || 'email',
  }

  complaint.emailUpdates.unshift(emailRecord)

  complaint.timeline.push({
    status: complaint.status,
    progress: complaint.progress,
    date: new Date().toISOString().slice(0, 10),
    note: finalMessage,
    emailSent: Boolean(sendEmail),
  })

  // Create in-app notification for the student
  const inAppNotif = {
    id: `NOT-${Date.now()}`,
    userEmail: studentEmail,
    title: finalSubject,
    message: finalMessage,
    type: 'complaint',
    complaintId: complaint.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  notifications.unshift(inAppNotif)
  saveJson('complaints.json', complaints)
  saveJson('notifications.json', notifications)

  return res.json({ complaint, emailResult, emailRecord })
})

app.patch('/api/complaints/:id/evidence-review', async (req, res) => {
  const { id } = req.params
  const { decision, reason = '' } = req.body || {}
  const complaint = complaints.find((c) => c.id === id)
  if (!complaint) return res.status(404).json({ message: 'Complaint not found.' })

  const today = new Date().toISOString().slice(0, 10)
  complaint.lastUpdated = today
  complaint.timeline = complaint.timeline || []
  complaint.emailUpdates = complaint.emailUpdates || []

  const isApproved = decision === 'approve'
  complaint.evidenceStatus = isApproved ? 'Approved' : 'Rejected'

  if (isApproved) {
    complaint.status = 'Assigned'
    complaint.progress = Math.max(complaint.progress || 10, 25)
    complaint.timeline.push({
      status: 'Assigned',
      progress: complaint.progress,
      date: today,
      note: 'Evidence reviewed & verified by Admin. Technician dispatched to inspect issue.',
      emailSent: true,
    })
  } else {
    complaint.status = 'Rejected'
    complaint.timeline.push({
      status: 'Rejected',
      progress: complaint.progress || 10,
      date: today,
      note: `Evidence rejected by Admin: ${reason || 'Uploaded photo does not show the reported issue.'}`,
      emailSent: true,
    })
  }

  saveJson('complaints.json', complaints)

  // Notify student
  const studentEmail = complaint.submittedByEmail || 'aarav@student.dcrust.in'
  const notifObj = createNotification(
    'complaint',
    isApproved ? 'Evidence Verified & Technician Assigned' : 'Evidence Photo Rejected',
    isApproved
      ? `Your photo evidence for "${complaint.title}" has been verified by the maintenance office. Work assigned.`
      : `Your photo evidence for "${complaint.title}" was rejected: ${reason || 'Photo does not show the reported defect. Please re-submit with actual damage photo.'}`
  )
  notifObj.userEmail = studentEmail
  notifications.unshift(notifObj)
  saveJson('notifications.json', notifications)

  return res.json({ message: `Evidence ${isApproved ? 'approved' : 'rejected'} successfully`, complaint })
})

app.post('/api/complaints/:id/notify', async (req, res) => {
  const { id } = req.params
  const {
    progress,
    status,
    emailSubject,
    emailMessage,
    reviewerRole = 'admin',
    sendEmail = true,
  } = req.body || {}

  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' })
  }

  if (status) complaint.status = status

  if (progress !== undefined && progress !== null && !Number.isNaN(Number(progress))) {
    complaint.progress = Math.min(100, Math.max(0, Number(progress)))
  }

  complaint.lastUpdated = new Date().toISOString().slice(0, 10)
  complaint.emailUpdates = complaint.emailUpdates || []
  complaint.timeline = complaint.timeline || []

  const student = demoUsers.find((entry) => entry.name === complaint.submittedBy)
    || demoUsers.find((entry) => entry.email?.toLowerCase() === String(complaint.submittedByEmail || '').toLowerCase())

  const studentEmail = complaint.submittedByEmail || student?.email || 'aarav@student.dcrust.in'

  const finalSubject = emailSubject || `[Update: ${complaint.progress}% - ${complaint.status}] ${complaint.title}`
  const finalMessage = String(emailMessage || `Your complaint has reached ${complaint.progress}% resolution stage.`).trim()

  let emailResult = { sent: false, mode: 'skipped' }

  if (sendEmail) {
    emailResult = await notifyStudent({
      student: {
        ...student,
        name: student?.name || complaint.submittedBy || 'Student',
        email: studentEmail,
        phone: student?.phone,
      },
      type: `Complaint Progress (${complaint.progress}%)`,
      title: finalSubject,
      message: `${finalMessage}\n\nComplaint ID: ${complaint.id}\nStatus: ${complaint.status}\nProgress: ${complaint.progress}%\nLocation: ${complaint.location}`,
    })
  }

  const emailRecord = {
    id: `EML-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    date: new Date().toISOString(),
    sender: reviewerRole === 'admin' ? 'Campus Admin (Prince Chahal)' : `${reviewerRole} Office`,
    recipient: studentEmail,
    subject: finalSubject,
    message: finalMessage,
    status: complaint.status,
    progress: complaint.progress,
    delivered: Boolean(emailResult?.sent || emailResult?.mode === 'dry-run'),
    mode: emailResult?.mode || 'email',
  }

  complaint.emailUpdates.unshift(emailRecord)

  complaint.timeline.push({
    status: complaint.status,
    progress: complaint.progress,
    date: new Date().toISOString().slice(0, 10),
    note: finalMessage,
    emailSent: Boolean(sendEmail),
  })

  notifications.unshift({
    id: `NOT-${Date.now()}`,
    userEmail: studentEmail,
    title: finalSubject,
    message: finalMessage,
    type: 'complaint',
    complaintId: complaint.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  })
  saveJson('complaints.json', complaints)
  saveJson('notifications.json', notifications)

  return res.json({ complaint, emailResult, emailRecord })
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
    approvalHistory: [{
      stage: 'Submission',
      status: 'Submitted',
      date: new Date().toISOString(),
      note: 'Request submitted for approval.',
    }],
    submittedBy: permission.submittedBy || 'Student',
    department: permission.department || '',
    faculty: permission.faculty || 'Department Faculty',
    details: permission.details || 'Permission request submitted for administrative review.',
  }

  permissions.unshift(newPermission)
  saveJson('permissions.json', permissions)

  const submittedEmail = String(permission.submittedByEmail || '').trim()
  const student = demoUsers.find((entry) => entry.email?.toLowerCase() === submittedEmail.toLowerCase())
    || demoUsers.find((entry) => entry.name === permission.submittedBy)
  const targetEmail = submittedEmail || student?.email

  if (student || targetEmail) {
    const notif = createNotification('permission', 'Permission request submitted', `Your permission request for "${newPermission.title}" has been submitted for review.`)
    notif.userEmail = targetEmail
    notifications.unshift(notif)
    saveJson('notifications.json', notifications)
    await notifyStudent({
      student: { ...student, name: student?.name || permission.submittedBy || 'Student', email: targetEmail },
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
  if (!['approve', 'final_approve', 'reject', 'return'].includes(reviewDecision)) {
    return res.status(400).json({ message: 'Choose approve, final_approve, reject, or return for the permission request.' })
  }

  if (permission.status === 'Approved' || permission.status === 'Rejected') {
    return res.status(409).json({ message: 'This permission workflow is already complete.' })
  }

  const isSuperAdmin = reviewerRole === 'admin'
  const now = new Date().toISOString()
  const reviewComment = String(comment || '').trim()

  if (reviewDecision === 'final_approve') {
    // Super Admin one-click full clearance
    permission.approvalChain.forEach((stage) => {
      if (stage.status !== 'Approved') {
        stage.status = 'Approved'
        stage.decidedAt = now
        stage.comment = reviewComment || 'Final approval granted by University Administration'
      }
    })
    permission.status = 'Approved'
    permission.currentStage = null
    permission.approvalHistory = [
      ...(permission.approvalHistory || []),
      {
        stage: 'University Administration',
        status: 'Approved',
        date: now,
        note: reviewComment || 'Full final approval granted by University Administration',
      },
    ]
  } else {
    const currentIndex = permission.approvalChain.findIndex((stage) => stage.stage === permission.currentStage)
    const current = permission.approvalChain[currentIndex]
    if (!current || current.status !== 'Pending') {
      return res.status(409).json({ message: 'No approval stage is currently awaiting review.' })
    }

    if (!isSuperAdmin) {
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
    }

    if (['return', 'reject'].includes(reviewDecision) && !reviewComment) {
      return res.status(400).json({ message: 'Add a comment explaining the requested changes or rejection.' })
    }

    current.status = reviewDecision === 'approve' ? 'Approved' : reviewDecision === 'return' ? 'Returned' : 'Rejected'
    current.decidedAt = now
    current.comment = reviewComment || (reviewDecision === 'approve' ? 'Approved by University Administration' : '')
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
  }

  const student = demoUsers.find((entry) => entry.name === permission.submittedBy)
    || demoUsers.find((entry) => entry.email?.toLowerCase() === String(permission.submittedByEmail || '').toLowerCase())
  const studentEmail = permission.submittedByEmail || student?.email

  if (student || studentEmail) {
    let statusMessage = ''
    let notifTitle = `Permission ${permission.status}: ${permission.title}`

    if (reviewDecision === 'final_approve') {
      statusMessage = `Great news! Your permission request for "${permission.title}" has been granted FULL & FINAL APPROVAL by the University Administration. You may proceed with the activity.${reviewComment ? ` Note: ${reviewComment}` : ''}`
      notifTitle = `Permission Fully Approved: ${permission.title}`
    } else if (reviewDecision === 'return') {
      statusMessage = `Your permission request for "${permission.title}" needs changes. ${permission.currentStage ? `It has been returned to ${permission.currentStage}.` : 'Please revise it and contact your Department Head.'} Reviewer note: ${reviewComment}`
      notifTitle = `Changes Requested: ${permission.title}`
    } else {
      statusMessage = `Your permission request for "${permission.title}" was approved by ${reviewerRole === 'admin' ? 'University Administration' : (permission.approvalHistory[permission.approvalHistory.length - 1]?.stage || 'Reviewer')}.${permission.currentStage ? ` It is now awaiting review from: ${permission.currentStage}.` : ` Final status: ${permission.status}.`}${reviewComment ? ` Note: ${reviewComment}` : ''}`
      notifTitle = `Permission Update: ${permission.title}`
    }

    const notifObj = createNotification('permission', notifTitle, statusMessage)
    notifObj.userEmail = studentEmail
    notifications.unshift(notifObj)

    const emailResult = await notifyStudent({
      student: { ...student, name: student?.name || permission.submittedBy, email: studentEmail },
      type: 'Permission Update',
      title: notifTitle,
      message: statusMessage,
    })

    permission.emailUpdates = permission.emailUpdates || []
    permission.emailUpdates.unshift({
      id: `EML-PER-${Date.now()}`,
      date: now,
      sender: reviewerRole === 'admin' ? 'Campus Admin (Prince Chahal)' : 'University Administration',
      recipient: studentEmail,
      subject: notifTitle,
      message: statusMessage,
      status: permission.status,
      delivered: Boolean(emailResult?.email?.sent || emailResult?.email?.mode === 'dry-run'),
    })
  }

  saveJson('permissions.json', permissions)
  saveJson('notifications.json', notifications)

  return res.json(permission)
})

app.patch('/api/permissions/:id/resubmit', (req, res) => {
  const permission = permissions.find((item) => item.id === req.params.id)

  if (!permission) {
    return res.status(404).json({ message: 'Permission request not found.' })
  }

  if (permission.status !== 'Changes Requested' || permission.currentStage !== null) {
    return res.status(409).json({ message: 'This request is not waiting for student changes.' })
  }

  const studentResponse = String(req.body?.studentResponse || '').trim()

  if (!studentResponse) {
    return res.status(400).json({ message: 'Add a response describing the changes or clarification.' })
  }

  const now = new Date().toISOString()

  permission.details = req.body?.details
    ? String(req.body.details).trim()
    : permission.details

  permission.studentResponse = studentResponse
  permission.status = 'Pending Approval'
  permission.currentStage = 'Department Head'
  permission.approvalChain = buildApprovalChain(permission.type)

  permission.approvalHistory = [
    ...(permission.approvalHistory || []),
    { stage: 'Student', status: 'Resubmitted', date: now, note: studentResponse },
  ]
  saveJson('permissions.json', permissions)
  return res.json(permission)
})

app.get('/api/notifications', (req, res) => {
  res.json(notifications)
})

app.patch('/api/notifications/read-all', (req, res) => {
  const { userEmail } = req.body || {}
  const targetEmail = String(userEmail || '').trim().toLowerCase()

  notifications.forEach((item) => {
    if (!targetEmail || (item.userEmail && item.userEmail.toLowerCase() === targetEmail)) {
      item.isRead = true
    }
  })
  saveJson('notifications.json', notifications)
  res.json({ message: 'All notifications marked as read', notifications })
})

app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params
  const item = notifications.find((n) => n.id === id)
  if (item) {
    item.isRead = true
    saveJson('notifications.json', notifications)
  }
  res.json({ message: 'Notification marked as read', notification: item })
})

app.delete('/api/notifications/clear', (req, res) => {
  const { userEmail } = req.body || {}
  const targetEmail = String(userEmail || '').trim().toLowerCase()

  if (targetEmail) {
    const remaining = notifications.filter((item) => item.userEmail && item.userEmail.toLowerCase() !== targetEmail)
    notifications.length = 0
    notifications.push(...remaining)
  } else {
    notifications.length = 0
  }
  saveJson('notifications.json', notifications)
  res.json({ message: 'Notifications cleared', notifications })
})

const newsletterSubscribers = loadJson('subscribers.json', [
  { email: 'aarav@student.dcrust.in', subscribedAt: '2026-10-02T10:00:00Z' },
])

app.get('/api/newsletter/subscribers', (req, res) => {
  res.json({
    total: newsletterSubscribers.length,
    subscribers: newsletterSubscribers,
  })
})

app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email } = req.body || {}
  const normalizedEmail = String(email || '').trim().toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' })
  }

  const existing = newsletterSubscribers.find((s) => s.email.toLowerCase() === normalizedEmail)
  if (existing) {
    return res.status(200).json({
      success: true,
      alreadySubscribed: true,
      message: 'You are already subscribed to DCRUST Smart Campus updates!',
      email: normalizedEmail,
    })
  }

  const newSubscriber = {
    email: normalizedEmail,
    subscribedAt: new Date().toISOString(),
  }
  newsletterSubscribers.unshift(newSubscriber)
  saveJson('subscribers.json', newsletterSubscribers)

  const welcomeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #142B4A; padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">DCRUST Smart Campus</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #14B8A6;">Campus Maintenance & Services Portal</p>
      </div>
      <div style="padding: 24px 8px; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Welcome to Smart Campus Updates! 🎉</h3>
        <p style="font-size: 14px; line-height: 1.6;">
          Thank you for subscribing with <strong>${normalizedEmail}</strong>. You will now receive:
        </p>
        <ul style="font-size: 14px; line-height: 1.8; color: #475569;">
          <li>⚡ Campus utility & maintenance updates (Power, Water, Wi-Fi)</li>
          <li>📢 Important administrative notices & service schedules</li>
          <li>📅 Upcoming campus events & safety advisories</li>
        </ul>
        <p style="font-size: 14px; line-height: 1.6; margin-top: 20px;">
          You can track complaints and submit service requests at any time by visiting the portal.
        </p>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        Deenbandhu Chhotu Ram University of Science and Technology, Murthal (DCRUST)<br/>
        &copy; 2026 DCRUST Smart Campus Services
      </div>
    </div>
  `

  const emailResult = await sendEmailNotification({
    to: normalizedEmail,
    subject: 'Welcome to DCRUST Smart Campus Updates! 📢',
    text: `Welcome to DCRUST Smart Campus Updates! Thank you for subscribing with ${normalizedEmail}. You will now receive campus maintenance notices, utility schedules, and event announcements directly in your inbox.`,
    html: welcomeHtml,
  })

  return res.status(201).json({
    success: true,
    alreadySubscribed: false,
    message: 'Subscribed successfully! A confirmation email has been sent to your inbox.',
    email: normalizedEmail,
    emailResult,
  })
})

app.listen(port, () => {
  console.log(`Campus backend running on http://localhost:${port}`)
})
