'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type LoginState } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initial: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial)

  return (
    <Card className="w-full shadow-xl shadow-black/5 ring-1 ring-[var(--border)]">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Detail akun</CardTitle>
        <CardDescription>Masukkan email dan password Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!state.fields?.email}
              aria-describedby={state.fields?.email ? 'email-error' : undefined}
            />
            {state.fields?.email && (
              <p id="email-error" className="text-sm text-[var(--danger)]">{state.fields.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={!!state.fields?.password}
            />
            {state.fields?.password && (
              <p className="text-sm text-[var(--danger)]">{state.fields.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Memproses…' : 'Masuk'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/lupa-password" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
            Lupa password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
