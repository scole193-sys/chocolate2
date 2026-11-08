import { neon } from '@neondatabase/serverless'

// DATABASE_URL comes from velvet-cacao/.env (loaded with node --env-file).
export const hasDatabase = Boolean(process.env.DATABASE_URL)
export const sql = hasDatabase ? neon(process.env.DATABASE_URL) : null

export function requireDatabase() {
  if (!sql) {
    console.error('DATABASE_URL is not set. Add your Neon connection string to velvet-cacao/.env (see .env.example).')
    process.exit(1)
  }
  return sql
}
