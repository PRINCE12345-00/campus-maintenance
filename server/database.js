import pg from 'pg'

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL
export const isDatabaseConfigured = Boolean(databaseUrl)

const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  : null

const entityNames = ['complaints', 'permissions', 'notifications', 'users']

export async function initializeDatabase(seedData) {
  if (!pool) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL must be configured in production. Refusing to start with temporary in-memory data.')
    }
    console.warn('DATABASE_URL is not set; the API is using temporary in-memory data.')
    return seedData
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS campus_records (
      entity TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (entity, id)
    )
  `)

  const loaded = {}
  for (const entity of entityNames) {
    const result = await pool.query('SELECT id, data FROM campus_records WHERE entity = $1 ORDER BY updated_at DESC', [entity])
    if (result.rows.length) {
      loaded[entity] = result.rows.map((row) => row.data)
      continue
    }

    const seeds = seedData[entity] || []
    for (const record of seeds) {
      await saveRecord(entity, record)
    }
    loaded[entity] = seeds
  }

  return loaded
}

export async function saveRecord(entity, record) {
  if (!pool) return
  await pool.query(
    `INSERT INTO campus_records (entity, id, data, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (entity, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [entity, String(record.id), JSON.stringify(record)],
  )
}

export async function saveCollection(entity, records) {
  if (!pool) return
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM campus_records WHERE entity = $1', [entity])
    for (const record of records) {
      await client.query(
        'INSERT INTO campus_records (entity, id, data, updated_at) VALUES ($1, $2, $3::jsonb, NOW())',
        [entity, String(record.id), JSON.stringify(record)],
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closeDatabase() {
  if (pool) await pool.end()
}
