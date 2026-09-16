interface PreviewDatabaseConfig {
  connectionString?: string
  previewProjectRef?: string
  productionProjectRef?: string
}

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

/**
 * Prevents Playwright database helpers from connecting to production.
 * Supabase pooler URLs contain the project ref in the username and direct
 * connection URLs contain it in the hostname, so both parts are checked.
 */
export function assertPreviewDatabaseUrl({
  connectionString,
  previewProjectRef,
  productionProjectRef,
}: PreviewDatabaseConfig): string {
  const previewRef = normalize(previewProjectRef)
  const productionRef = normalize(productionProjectRef)

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for Playwright database helpers')
  }

  if (!previewRef || !productionRef) {
    throw new Error(
      'SUPABASE_PROJECT_REF_PREVIEW and SUPABASE_PROJECT_REF_PRODUCTION are required',
    )
  }

  if (previewRef === productionRef) {
    throw new Error('Preview and production Supabase project refs must be different')
  }

  let databaseUrl: URL
  try {
    databaseUrl = new URL(connectionString)
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL')
  }

  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol')
  }

  const connectionIdentity = `${databaseUrl.username}@${databaseUrl.hostname}`.toLowerCase()

  if (connectionIdentity.includes(productionRef)) {
    throw new Error('Refusing to connect Playwright database helpers to production')
  }

  if (!connectionIdentity.includes(previewRef)) {
    throw new Error('DATABASE_URL does not match the configured preview project ref')
  }

  return connectionString
}
