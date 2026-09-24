import Link from 'next/link'
import { CalendarRange, ChevronRight, ExternalLink, GalleryHorizontalEnd, Images, Megaphone, MessageSquareQuote, MessagesSquare, School, Settings2, Sparkles, type LucideIcon } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { CONTENT_SECTIONS } from '@/lib/cms/registry'
import { PageHeader, Panel } from '@/components/dashboard/primitives'

export const metadata = { title: 'Kelola Website' }

const ICONS: Record<string, LucideIcon> = {
  slider: GalleryHorizontalEnd,
  kegiatan: Sparkles,
  pengumuman: Megaphone,
  galeri: Images,
  fasilitas: School,
  testimoni: MessageSquareQuote,
  faq: MessagesSquare,
  ppdb: CalendarRange,
}

export default async function WebsiteHubPage() {
  await requireAdminStaff()
  const now = new Date()
  const [slides, activities, announcements, gallery, facilities, testimonials, faqs, periods, activePeriod] = await Promise.all([
    db.heroSlide.count({ where: { isActive: true } }),
    db.activity.count({ where: { status: 'PUBLISHED' } }),
    db.announcement.count({ where: { status: 'PUBLISHED' } }),
    db.galleryItem.count({ where: { isActive: true } }),
    db.facility.count({ where: { isActive: true } }),
    db.testimonial.count({ where: { isActive: true } }),
    db.faq.count({ where: { isActive: true } }),
    db.admissionPeriod.count(),
    db.admissionPeriod.findFirst({ where: { isActive: true } }),
  ])
  const counts: Record<string, string> = {
    slider: `${slides} slide tampil`,
    kegiatan: `${activities} terbit`,
    pengumuman: `${announcements} terbit`,
    galeri: `${gallery} foto tampil`,
    fasilitas: `${facilities} fasilitas tampil`,
    testimoni: `${testimonials} testimoni tampil`,
    faq: `${faqs} pertanyaan tampil`,
    ppdb: `${periods} periode`,
  }
  const ppdbOpen = Boolean(activePeriod && activePeriod.startDate <= now && activePeriod.endDate >= now)

  const items = [
    { href: '/website/pengaturan', icon: Settings2, title: 'Pengaturan Situs', description: 'Identitas, kontak, WhatsApp, peta, media sosial, sambutan kepala sekolah', meta: '' },
    ...Object.values(CONTENT_SECTIONS).map((section) => ({ href: `/website/${section.key}`, icon: ICONS[section.key], title: section.title, description: section.description, meta: counts[section.key] })),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Website sekolah"
        title="Kelola Website"
        description="Ganti foto, teks, dan konten website. Perubahan langsung tampil setelah disimpan."
        actions={<a href="/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium hover:bg-[var(--muted)]"><ExternalLink className="size-4" /> Buka website</a>}
      />

      <Link href="/website/ppdb" className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm transition-colors hover:bg-[var(--muted)]/60">
        <span className="flex items-center gap-2.5">
          <span className={`size-2 rounded-full ${ppdbOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
          <span>
            <strong className="font-medium">PPDB {ppdbOpen ? 'dibuka' : 'ditutup'}</strong>
            <span className="text-[var(--muted-foreground)]">
              {' · '}
              {ppdbOpen
                ? `${activePeriod!.name}, formulir tampil di website`
                : activePeriod
                  ? `"${activePeriod.name}" aktif tetapi hari ini di luar tanggal periode`
                  : 'tidak ada periode aktif, formulir tidak tampil'}
            </span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">Atur periode <ChevronRight className="size-3.5" /></span>
      </Link>

      <Panel title="Konten website" description="Pilih bagian yang ingin diubah." flush>
        <ul className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--muted)]/60">
                <item.icon className="size-[18px] shrink-0 text-[var(--muted-foreground)] transition-colors group-hover:text-[var(--primary)]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">{item.description}</p>
                </div>
                {item.meta && <span className="hidden shrink-0 text-xs tabular-nums text-[var(--muted-foreground)] sm:block">{item.meta}</span>}
                <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
