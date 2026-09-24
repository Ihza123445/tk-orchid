import 'server-only'
import crypto from 'node:crypto'
import { db } from '@/lib/db/db'

const TOKEN_TTL_MS = 30 * 60 * 1000 // 30 menit

/**
 * Buat token reset single-use. Yang disimpan di DB hanya hash (SHA-256),
 * token plaintext dikembalikan sekali untuk dikirim ke user.
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
  await db.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } })
  return token
}

/** Verifikasi token: harus ada, belum expired, belum dipakai. Return userId atau null. */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  if (!token) return null
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash } })
  if (!row || row.usedAt) return null
  if (row.expiresAt.getTime() < Date.now()) return null
  return row.userId
}

/** Konsumsi token (single-use) + ganti password + invalidasi via isActive tetap. */
export async function consumePasswordResetToken(token: string, newPasswordHash: string): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token)
  if (!userId) return false
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await db.$transaction([
    db.passwordResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: userId }, data: { passwordHash: newPasswordHash } }),
  ])
  return true
}
