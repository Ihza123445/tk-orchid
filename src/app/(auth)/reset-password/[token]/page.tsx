import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Atur Ulang Password' }

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  return (
    <AuthShell
      eyebrow="Keamanan akun"
      title="Buat password baru"
      description="Gunakan minimal 8 karakter dan pilih kombinasi yang tidak mudah ditebak."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  )
}
