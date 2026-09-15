import { describe, expect, it } from 'vitest'
import { assertPreviewDatabaseUrl } from './databaseSafety'

const previewProjectRef = 'preview123'
const productionProjectRef = 'production456'

describe('assertPreviewDatabaseUrl', () => {
  it('accepts a Supabase pooler URL for the preview project', () => {
    const connectionString =
      'postgresql://postgres.preview123:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'

    expect(
      assertPreviewDatabaseUrl({
        connectionString,
        previewProjectRef,
        productionProjectRef,
      }),
    ).toBe(connectionString)
  })

  it('accepts a direct Supabase URL for the preview project', () => {
    const connectionString =
      'postgresql://postgres:password@db.preview123.supabase.co:5432/postgres'

    expect(
      assertPreviewDatabaseUrl({
        connectionString,
        previewProjectRef,
        productionProjectRef,
      }),
    ).toBe(connectionString)
  })

  it('rejects a production database URL', () => {
    expect(() =>
      assertPreviewDatabaseUrl({
        connectionString:
          'postgresql://postgres.production456:password@pooler.supabase.com:6543/postgres',
        previewProjectRef,
        productionProjectRef,
      }),
    ).toThrow('Refusing to connect Playwright database helpers to production')
  })

  it('rejects a database that cannot be identified as preview', () => {
    expect(() =>
      assertPreviewDatabaseUrl({
        connectionString:
          'postgresql://postgres.unknown:password@pooler.supabase.com:6543/postgres',
        previewProjectRef,
        productionProjectRef,
      }),
    ).toThrow('DATABASE_URL does not match the configured preview project ref')
  })

  it('rejects equal preview and production refs', () => {
    expect(() =>
      assertPreviewDatabaseUrl({
        connectionString:
          'postgresql://postgres.preview123:password@pooler.supabase.com:6543/postgres',
        previewProjectRef,
        productionProjectRef: previewProjectRef,
      }),
    ).toThrow('Preview and production Supabase project refs must be different')
  })
})
