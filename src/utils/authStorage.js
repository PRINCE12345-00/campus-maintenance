/**
 * Client-side user metadata cache for UI demo & display purposes only.
 * 
 * SECURITY NOTE:
 * - LocalStorage is NOT an authoritative source of authentication or password security.
 * - Password authentication, hashing (e.g., bcrypt/argon2), and reset verification
 *   must always be executed by the secure backend service.
 * - No passwords or password hashes are stored in client-side storage.
 */

const STORAGE_KEY = 'scms-registered-users'

// Strictly fictional demo profiles for UI display (no personal info, no credentials)
export const DEFAULT_USERS = [
  {
    id: 'DEMO-STU-01',
    rollNumber: '2026001001',
    name: 'Demo Student',
    email: 'student@demo.campus',
    role: 'student',
    department: 'Computer Science & Engineering',
    batch: '2026',
  },
  {
    id: 'DEMO-ADM-01',
    rollNumber: 'ADM-1001',
    name: 'Campus Administrator',
    email: 'admin@demo.campus',
    role: 'admin',
    department: 'Administrative Office',
  },
  {
    id: 'DEMO-HOD-01',
    rollNumber: 'HOD-1001',
    name: 'Department Head',
    email: 'hod@demo.campus',
    role: 'department_head',
    department: 'Computer Science & Engineering',
  },
]

/**
 * Retrieve cached public user profiles for UI display.
 * Legacy passwords or plaintext credentials are never preserved or migrated.
 */
export function getLocalRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Return only sanitized public profiles without any sensitive fields
        return parsed.map(({ password, passwordHash, ...safeUser }) => safeUser)
      }
    }
  } catch {
    // Fall back to default demo profiles on parse error
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
  } catch {}
  return DEFAULT_USERS
}

/**
 * Cache public user profile metadata for offline UI display.
 * Passwords and sensitive credentials are never stored in localStorage.
 */
export function saveLocalUser(userData) {
  if (!userData) return null
  const users = getLocalRegisteredUsers()
  const email = String(userData.email || '').trim().toLowerCase()
  const rollNumber = String(userData.rollNumber || userData.id || '').trim()

  const existingIndex = users.findIndex(
    (u) =>
      (email && String(u.email || '').toLowerCase() === email) ||
      (rollNumber && String(u.rollNumber || u.id || '').toLowerCase() === rollNumber.toLowerCase()),
  )

  // Store only public profile information — NEVER passwords or hashes
  const safeProfile = {
    id: userData.id || rollNumber || `USR-${Date.now()}`,
    rollNumber: rollNumber || userData.id || '',
    name: String(userData.name || 'Campus User').trim(),
    email,
    role: userData.role || 'student',
    department: userData.department || 'General',
    batch: userData.batch || '2026',
  }

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...safeProfile }
  } else {
    users.push(safeProfile)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.warn('Could not cache user profile to localStorage:', err)
  }

  return safeProfile
}

/**
 * Client-side authentication stub.
 * 
 * Password verification is authoritative ONLY on the backend service.
 * Returns a clear error message requiring backend authentication.
 */
export function authenticateLocally(identifier, password) {
  const rawId = String(identifier || '').trim()
  const rawPass = String(password || '')

  if (!rawId || !rawPass) {
    return {
      success: false,
      message: 'Please enter both your email/roll number and password.',
    }
  }

  // Authoritative password verification must be handled by the backend
  return {
    success: false,
    message: 'Backend server is unavailable. Secure authentication requires connection to the backend service.',
  }
}

/**
 * Direct unverified password reset stub.
 * 
 * Direct resets based solely on identifier are disallowed.
 * A verified reset flow (such as backend OTP or secure token verification) is required.
 */
export function directResetLocalPassword(identifier, newPassword) {
  const rawId = String(identifier || '').trim()
  if (!rawId || !newPassword) {
    return {
      success: false,
      message: 'Please provide both your identifier and new password.',
    }
  }

  return {
    success: false,
    message: 'Password reset requires verified backend authorization (e.g. email OTP verification). Direct unverified reset is not permitted.',
  }
}
