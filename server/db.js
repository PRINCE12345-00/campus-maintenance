import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'database.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function loadDatabase(defaultState) {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      console.log('[Database] Loaded persistent data from database.json')
      return parsed
    }
  } catch (err) {
    console.error('[Database] Failed to read database.json, seeding defaults:', err.message)
  }

  saveDatabase(defaultState)
  console.log('[Database] Seeded initial database.json with default demo records.')
  return defaultState
}

export function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('[Database] Failed to save database.json:', err.message)
  }
}
