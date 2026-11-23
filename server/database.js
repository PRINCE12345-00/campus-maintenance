const databaseUrl = process.env.DATABASE_URL
export const isDatabaseConfigured = Boolean(databaseUrl)

let pool = null

async function getPool() {
  if (pool) return pool
  if (!isDatabaseConfigured) return null
  try {
    const pgModule = await import('pg')
    const Pool = pgModule.default?.Pool || pgModule.Pool
    if (!Pool) return null
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
    return pool
  } catch (err) {
    console.warn('PostgreSQL pg module not available. Operating in standalone in-memory mode:', err.message)
    return null
  }
}

const entityNames = ['complaints', 'permissions', 'notifications', 'users', 'subscribers']

export async function initializeDatabase(seedData) {
  const activePool = await getPool()
  if (!activePool) {
    console.warn('DATABASE_URL is not set; the API is using persistent JSON/in-memory records.')
    return seedData
  }

  await activePool.query(`
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
    const result = await activePool.query('SELECT id, data FROM campus_records WHERE entity = $1 ORDER BY updated_at DESC', [entity])
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
  const activePool = await getPool()
  if (!activePool) return
  await activePool.query(
    `INSERT INTO campus_records (entity, id, data, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (entity, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [entity, String(record.id), JSON.stringify(record)],
  )
}

export async function saveCollection(entity, records) {
  const activePool = await getPool()
  if (!activePool) return
  const client = await activePool.connect()
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
