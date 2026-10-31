import { demoUsers } from '../data/mockData'

const isDemoStudent = (user) => user?.email === demoUsers.student.email

export function getStudentComplaints(records, user) {
  if (!user || user.role === 'admin') return records
  if (isDemoStudent(user)) {
    return records.filter((record) => record.submittedBy === demoUsers.student.name || record.submittedById === user.id)
  }
  return records.filter((record) => record.submittedById === user.id || record.submittedByEmail === user.email)
}

export function getStudentPermissions(records, user) {
  if (!user || user.role === 'admin') return records
  if (isDemoStudent(user)) {
    return records.filter((record) => record.submittedBy === demoUsers.student.name || record.submittedById === user.id)
  }
  return records.filter((record) => record.submittedById === user.id || record.submittedByEmail === user.email)
}

export function getStudentNotifications(records, user) {
  if (!user || user.role === 'admin') return records
  if (isDemoStudent(user)) {
    return records.filter((record) => !record.userEmail || record.userEmail === user.email)
  }
  return records.filter((record) => record.userEmail === user.email)
}
