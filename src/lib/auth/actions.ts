'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { setSessionCookie, clearSessionCookie, getSessionUser } from '@/lib/auth/guard'
import { isRateLimited, recordFailure, clearFailures, audit } from '@/lib/auth/rate-limit'
import { createPasswordResetToken } from '@/lib/auth/reset'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

function dashboardFor(role: string): string {
  if (role === 'TEACHER') return '/guru/dashboard'
  if (role === 'PARENT') return '/ortu/dashboard'
  return '/dashboard'
}

export interface LoginState {
  error?: string
  fields?: { email?: string; password?: string }
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) {
    const fields: LoginState['fields'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as 'email' | 'password'
      if (!fields[key]) fields[key] = issue.message
    }
    return { error: 'Periksa kembali data yang diisi.', fields }
  }

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const key = `${ip}:${parsed.data.email}`

  if (isRateLimited(key)) {
    await audit({ action: 'LOGIN_RATE_LIMITED', entityType: 'USER', ipAddress: ip })
    return { error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' }
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } })
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false

  if (!user || !valid) {
    recordFailure(key)
    await audit({ action: 'LOGIN_FAILED', entityType: 'USER', ipAddress: ip, afterJson: JSON.stringify({ email: parsed.data.email }) })
    return { error: 'Email atau password salah.' } // generic — jangan bocorkan mana yang salah
  }

  if (!user.isActive) {
    await audit({ userId: user.id, action: 'LOGIN_DISABLED', entityType: 'USER', entityId: user.id, ipAddress: ip })
    return { error: 'Akun dinonaktifkan. Hubungi administrator.' }
  }

  clearFailures(key)
  await setSessionCookie(user.id, user.role)
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await audit({ userId: user.id, action: 'LOGIN_SUCCESS', entityType: 'USER', entityId: user.id, ipAddress: ip })

  redirect(dashboardFor(user.role))
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser()
  if (user) {
    await audit({ userId: user.id, action: 'LOGOUT', entityType: 'USER', entityId: user.id })
  }
  await clearSessionCookie()
  redirect('/login')
}

const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
})

export interface ForgotState {
  message?: string
  devToken?: string
}

export async function forgotPasswordAction(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const parsed = forgotSchema.safeParse({ email: String(formData.get('email') ?? '').trim().toLowerCase() })
  if (!parsed.success) {
    return { message: 'Masukkan email yang valid.' }
  }
  const user = await db.user.findUnique({ where: { email: parsed.data.email } })
  // Selalu tampil pesan sama — jangan bocorkan keberadaan akun.
  const genericMessage = 'Jika email terdaftar, tautan reset password telah dikirim.'
  if (!user || !user.isActive) return { message: genericMessage }

  const token = await createPasswordResetToken(user.id)
  await audit({ userId: user.id, action: 'PASSWORD_RESET_REQUESTED', entityType: 'USER', entityId: user.id })

  // MVP lokal: belum ada SMTP. Token hanya ditampilkan di mode development untuk QA.
  if (process.env.NODE_ENV !== 'production') {
    return { message: genericMessage, devToken: token }
  }
  return { message: genericMessage }
}
