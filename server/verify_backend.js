import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')

console.log("=" * 70)
console.log("  BACKEND & DATABASE PERSISTENCE VERIFICATION")
console.log("=" * 70)

const requiredFiles = ['complaints.json', 'users.json', 'permissions.json', 'notifications.json']
let allFilesValid = true

for (const file of requiredFiles) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Missing database file: ${file}`)
    allFilesValid = false
  } else {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const count = Array.isArray(content) ? content.length : Object.keys(content).length
      console.log(`[PASS] ${file} is valid JSON (${count} records)`)
    } catch (e) {
      console.error(`[FAIL] Corrupted JSON in ${file}: ${e.message}`)
      allFilesValid = false
    }
  }
}

if (!allFilesValid) {
  console.error("Database integrity test failed.")
  process.exit(1)
}

console.log("\nAll persistent database tables verified successfully.")
process.exit(0)
