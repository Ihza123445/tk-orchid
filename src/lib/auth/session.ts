import 'server-only'
import crypto from 'node:crypto'

const SECRET = process.env.AUTH_SECRET ?? 'dev-secret-tk-orchid-change-me'
export const SESSION_COOKIE = 'orchid_session'
export const SESSION_TTL_S = 60 * 60 * 8 // 8 jam

interface SessionPayload {
  userId: number
  role: string
  exp: number
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url')
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

export function createSessionToken(userId: number, role: string): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S,
  }
  const body = b64url(JSON.stringify(payload))
  const sig = sign(body)
  return `${body}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(body)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    if (typeof payload.userId !== 'number' || typeof payload.role !== 'string') return null
    return payload
  } catch {
    return null
  }
}
