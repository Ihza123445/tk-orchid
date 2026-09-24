import { getSiteSettings } from '@/lib/cms/content'
import { SiteHeaderClient } from '@/components/public/site-header-client'

export async function SiteHeader() {
  const s = await getSiteSettings()
  return (
    <SiteHeaderClient
      info={{ schoolName: s.schoolName, tagline: s.tagline, topbarText: s.topbarText, hours: s.hours, email: s.email, address: s.address }}
    />
  )
}
