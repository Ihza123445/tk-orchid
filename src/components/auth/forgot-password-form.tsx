'use client'

import { useActionState } from 'react'
import { forgotPasswordAction, type ForgotState } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initial: ForgotState = {}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Memproses…' : 'Kirim Tautan Reset'}
          </Button>
        </form>
        {state.message && (
          <p className="rounded-md bg-[var(--secondary)] p-3 text-sm">{state.message}</p>
        )}
        {state.devToken && (
          <p className="break-all rounded-md border border-dashed p-3 text-xs text-[var(--muted-foreground)]">
            [DEV] Token reset: /reset-password/{state.devToken}
          </p>
        )}
        <div className="text-center text-sm">
          <a href="/login" className="underline underline-offset-4 opacity-80 hover:opacity-100">Kembali ke login</a>
        </div>
      </CardContent>
    </Card>
  )
}
