'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { audit } from '@/lib/auth/rate-limit'
import { consumePasswordResetToken } from '@/lib/auth/reset'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter.'),
    confirm: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirm'],
  })

export interface ResetState {
  error?: string
  fields?: { password?: string; confirm?: string }
  success?: boolean
}

export async function resetPasswordAction(token: string, _prev: ResetState, formData: FormData): Promise<ResetState> {
  if (!token) return { error: 'Token tidak ditemukan atau tidak valid.' }

  const parsed = resetSchema.safeParse({
    password: String(formData.get('password') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  })
  if (!parsed.success) {
    const fields: ResetState['fields'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as 'password' | 'confirm'
      if (!fields[key]) fields[key] = issue.message
    }
    return { error: 'Periksa kembali data yang diisi.', fields }
  }

  const hash = await bcrypt.hash(parsed.data.password, 12)
  const ok = await consumePasswordResetToken(token, hash)
  if (!ok) {
    return { error: 'Token tidak valid, sudah dipakai, atau kedaluwarsa.' }
  }
  await audit({ action: 'PASSWORD_RESET_COMPLETED', entityType: 'USER' })
  return { success: true }
}
