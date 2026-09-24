import { ExternalLink, Settings2 } from 'lucide-react'
import { HeaderButton, PageHeader } from '@/components/dashboard/primitives'
import { requireAdminStaff } from '@/lib/auth/guard'
import { getSiteSettings } from '@/lib/cms/content'
import { SettingsForm } from '@/components/website/settings-form'

export const metadata = { title: 'Pengaturan Situs' }

export default async function PengaturanSitusPage() {
  await requireAdminStaff()
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={Settings2}
        back={{ href: '/website', label: 'Kelola website' }}
        title="Pengaturan Situs"
        description="Identitas sekolah, kontak, WhatsApp, lokasi peta, dan sambutan kepala sekolah."
        actions={<HeaderButton href="/" external><ExternalLink /> Lihat website</HeaderButton>}
      />
      <SettingsForm settings={settings} />
    </div>
  )
}
