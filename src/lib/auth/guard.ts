import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db/db'
import { SESSION_COOKIE, SESSION_TTL_S, createSessionToken, verifySessionToken } from './session'

export type Role = 'ADMIN' | 'STAFF' | 'TEACHER' | 'PARENT'

export interface SessionUser {
  id: number
  name: string
  email: string
  role: Role
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value)
  if (!payload) return null
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
  if (!user || !user.isActive) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) redirect('/dashboard')
  return user
}

export async function requireAdminStaff(): Promise<SessionUser> {
  return requireRole('ADMIN', 'STAFF')
}

/** Guru hanya boleh akses kelas yang jadi assignment-nya (homeroom). */
export async function requireTeacherClassAccess(classId: number): Promise<SessionUser> {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) redirect('/guru/dashboard')
  const klass = await db.class.findUnique({ where: { id: classId } })
  if (!klass || klass.teacherId !== teacher.id) redirect('/guru/dashboard')
  return user
}

/** Parent hanya boleh akses siswa yang punya relasi guardian resmi. */
export async function requireGuardianStudentAccess(studentId: number): Promise<SessionUser> {
  const user = await requireRole('PARENT')
  const guardian = await db.guardian.findUnique({ where: { userId: user.id } })
  if (!guardian) redirect('/portal')
  const rel = await db.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId, guardianId: guardian.id } },
  })
  if (!rel) redirect('/portal')
  return user
}

export async function setSessionCookie(userId: number, role: string): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionToken(userId, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_S,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
