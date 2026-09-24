import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Lupa Password' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title="Lupa password?"
      description="Masukkan email akun dan kami akan menyiapkan tautan untuk membuat password baru."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
