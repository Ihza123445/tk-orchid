'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPasswordAction, type ResetState } from '@/lib/auth/reset-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initial: ResetState = {}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    async (prev: ResetState, formData: FormData) => resetPasswordAction(token, prev, formData),
    initial
  )

  if (state.success) {
    return (
      <Card className="w-full shadow-xl shadow-black/5 ring-1 ring-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-xl">Password Diperbarui</CardTitle>
          <CardDescription>Password Anda berhasil diatur ulang.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Masuk Sekarang</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-xl shadow-black/5 ring-1 ring-[var(--border)]">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Password baru</CardTitle>
        <CardDescription>Masukkan password baru untuk akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--danger)]">{state.error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
            {state.fields?.password && <p className="text-sm text-[var(--danger)]">{state.fields.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
            {state.fields?.confirm && <p className="text-sm text-[var(--danger)]">{state.fields.confirm}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Memproses…' : 'Simpan Password Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
