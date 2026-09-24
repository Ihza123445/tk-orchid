import { notFound } from 'next/navigation'
import { requireAdminStaff } from '@/lib/auth/guard'
import { CONTENT_SECTIONS } from '@/lib/cms/registry'
import { loadSectionOptions, loadSectionRows } from '@/lib/cms/admin-data'
import { ContentManager } from '@/components/website/content-manager'

export async function generateMetadata({ params }: PageProps<'/website/[section]'>) {
  const { section } = await params
  return { title: CONTENT_SECTIONS[section]?.title ?? 'Kelola Website' }
}

export default async function WebsiteSectionPage({ params }: PageProps<'/website/[section]'>) {
  await requireAdminStaff()
  const { section: key } = await params
  const section = CONTENT_SECTIONS[key]
  if (!section) notFound()

  const [rows, options] = await Promise.all([loadSectionRows(section), loadSectionOptions(section)])
  return <ContentManager section={section} rows={rows} options={options} />
}
