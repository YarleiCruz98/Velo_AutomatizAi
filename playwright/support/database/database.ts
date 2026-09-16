import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'
import { assertPreviewDatabaseUrl } from './databaseSafety'

const connectionString = assertPreviewDatabaseUrl({
  connectionString: process.env.DATABASE_URL,
  previewProjectRef: process.env.SUPABASE_PROJECT_REF_PREVIEW,
  productionProjectRef: process.env.SUPABASE_PROJECT_REF_PRODUCTION,
})

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
