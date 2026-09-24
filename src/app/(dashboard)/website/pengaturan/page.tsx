import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { getSiteSettings } from '@/lib/cms/content'
import { SettingsForm } from '@/components/website/settings-form'

export const metadata = { title: 'Pengaturan Situs' }

export default async function PengaturanSitusPage() {
  await requireAdminStaff()
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/website" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)] hover:underline">Kelola website</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pengaturan Situs</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Identitas sekolah, kontak, WhatsApp, lokasi peta, dan sambutan kepala sekolah.</p>
        </div>
        <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--muted)]">
          <ExternalLink className="size-4" /> Lihat website
        </Link>
      </header>
      <SettingsForm settings={settings} />
    </div>
  )
}
