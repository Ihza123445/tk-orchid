import 'server-only'
import { db } from '@/lib/db/db'

interface Attempt {
  count: number
  firstAt: number
}

const WINDOW_MS = 10 * 60 * 1000 // 10 menit
const MAX_ATTEMPTS = 5

const globalForRate = globalThis as unknown as { loginAttempts?: Map<string, Attempt> }
const attempts = globalForRate.loginAttempts ?? new Map<string, Attempt>()
if (process.env.NODE_ENV !== 'production') globalForRate.loginAttempts = attempts

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const a = attempts.get(key)
  if (!a) return false
  if (now - a.firstAt > WINDOW_MS) {
    attempts.delete(key)
    return false
  }
  return a.count >= MAX_ATTEMPTS
}

export function recordFailure(key: string): void {
  const now = Date.now()
  const a = attempts.get(key)
  if (!a || now - a.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
  } else {
    a.count += 1
  }
}

export function clearFailures(key: string): void {
  attempts.delete(key)
}

export async function audit(entry: {
  userId?: number | null
  action: string
  entityType: string
  entityId?: number | null
  beforeJson?: string | null
  afterJson?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        beforeJson: entry.beforeJson ?? null,
        afterJson: entry.afterJson ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    })
  } catch (err) {
    console.error('[audit] gagal menulis audit log:', err)
  }
}
