import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Masuk' }

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Selamat datang kembali"
      title="Masuk ke portal"
      description="Gunakan akun admin, staf, guru, atau orang tua yang sudah terdaftar."
    >
      <LoginForm />
    </AuthShell>
  )
}
