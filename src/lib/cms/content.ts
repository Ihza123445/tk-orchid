import 'server-only'
import { cache } from 'react'
import { db } from '@/lib/db/db'
import { DEFAULT_SETTINGS, type SiteSettings } from '@/lib/cms/defaults'

// Pembaca konten website publik. `cache` agar satu request cukup satu query per jenis konten.

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.siteSetting.findMany()
  const settings = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if (row.key in settings) settings[row.key as keyof SiteSettings] = row.value
  }
  return settings
})

const active = { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }] }

export const getHeroSlides = cache(() => db.heroSlide.findMany(active))
export const getFacilities = cache(() => db.facility.findMany(active))
export const getGalleryItems = cache(() => db.galleryItem.findMany(active))
export const getTestimonials = cache(() => db.testimonial.findMany(active))
export const getFaqs = cache(() => db.faq.findMany(active))
