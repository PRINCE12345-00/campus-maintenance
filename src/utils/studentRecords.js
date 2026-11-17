import { demoUsers } from '../data/mockData'

const isDemoStudent = (user) => {
  const email = String(user?.email || '').trim().toLowerCase()
  return email === demoUsers.student.email.toLowerCase()
}

export function getStudentComplaints(records, user) {
  if (!user || user.role === 'admin') return records || []
  if (!Array.isArray(records)) return []

  const userEmail = String(user.email || '').trim().toLowerCase()
  const userName = String(user.name || '').trim().toLowerCase()
  const userId = String(user.id || user.rollNumber || '').trim().toLowerCase()

  if (isDemoStudent(user)) {
    return records.filter((record) => {
      const recName = String(record.submittedBy || '').trim().toLowerCase()
      const recEmail = String(record.submittedByEmail || '').trim().toLowerCase()
      const recId = String(record.submittedById || '').trim().toLowerCase()
      return (
        recName === demoUsers.student.name.toLowerCase() ||
        recEmail === userEmail ||
        (userId && recId === userId)
      )
    })
  }

  return records.filter((record) => {
    const recEmail = String(record.submittedByEmail || '').trim().toLowerCase()
    const recId = String(record.submittedById || '').trim().toLowerCase()
    const recName = String(record.submittedBy || '').trim().toLowerCase()

    const matchEmail = Boolean(userEmail && recEmail && recEmail === userEmail)
    const matchId = Boolean(userId && recId && recId === userId)
    const matchName = Boolean(userName && recName && (
      recName === userName ||
      recName.split(' ')[0] === userName.split(' ')[0]
    ))

    return matchEmail || matchId || matchName
  })
}

export function getStudentPermissions(records, user) {
  if (!user || user.role === 'admin') return records || []
  if (!Array.isArray(records)) return []

  const userEmail = String(user.email || '').trim().toLowerCase()
  const userName = String(user.name || '').trim().toLowerCase()
  const userId = String(user.id || user.rollNumber || '').trim().toLowerCase()

  if (isDemoStudent(user)) {
    return records.filter((record) => {
      const recName = String(record.submittedBy || '').trim().toLowerCase()
      const recEmail = String(record.submittedByEmail || '').trim().toLowerCase()
      const recId = String(record.submittedById || '').trim().toLowerCase()
      return (
        recName === demoUsers.student.name.toLowerCase() ||
        recEmail === userEmail ||
        (userId && recId === userId)
      )
    })
  }

  return records.filter((record) => {
    const recEmail = String(record.submittedByEmail || '').trim().toLowerCase()
    const recId = String(record.submittedById || '').trim().toLowerCase()
    const recName = String(record.submittedBy || '').trim().toLowerCase()

    const matchEmail = Boolean(userEmail && recEmail && recEmail === userEmail)
    const matchId = Boolean(userId && recId && recId === userId)
    const matchName = Boolean(userName && recName && (
      recName === userName ||
      recName.split(' ')[0] === userName.split(' ')[0]
    ))

    return matchEmail || matchId || matchName
  })
}

export function getStudentNotifications(records, user) {
  if (!user || user.role === 'admin') return records || []
  if (!Array.isArray(records)) return []

  const userEmail = String(user.email || '').trim().toLowerCase()
  const userId = String(user.id || user.rollNumber || '').trim().toLowerCase()

  if (isDemoStudent(user)) {
    return records.filter((record) => {
      const targetEmail = String(record.userEmail || '').trim().toLowerCase()
      return !targetEmail || targetEmail === userEmail
    })
  }

  return records.filter((record) => {
    const targetEmail = String(record.userEmail || '').trim().toLowerCase()
    const targetId = String(record.userId || '').trim().toLowerCase()
    return (
      (userEmail && targetEmail && targetEmail === userEmail) ||
      (userId && targetId && targetId === userId)
    )
  })
}
