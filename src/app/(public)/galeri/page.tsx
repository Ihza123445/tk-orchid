import { SiteHeader } from '@/components/public/site-header'
import { GalleryGrid } from '@/components/public/gallery-grid'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { db } from '@/lib/db/db'
import { IMG } from '@/lib/assets/public-images'
import { getGalleryItems } from '@/lib/cms/content'

export const metadata = { title: 'Galeri' }
export const revalidate = 0

export default async function GaleriPage() {
  // Foto sampul kegiatan publik ikut tampil di galeri (kategori "Acara").
  const [gallery, activities] = await Promise.all([getGalleryItems(), db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC', coverImage: { not: null } },
    orderBy: { startDatetime: 'desc' },
    take: 12,
    select: { title: true, coverImage: true },
  })])
  const items = [
    ...activities.map((activity) => ({ image: activity.coverImage!, title: activity.title, category: 'Acara' })),
    ...gallery.map(({ image, title, category }) => ({ image, title, category })),
  ]

  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="05"
        eyebrow="Galeri foto"
        title="Potret kecil dari"
        accent="hari-hari ceria."
        description="Intip suasana kelas, area bermain, karya seni, dan acara spesial yang menjadi bagian dari perjalanan tumbuh anak-anak TK Orchid."
        image={IMG.hero2}
        imageAlt="Anak bermain balok warna-warni"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Jelajahi momen"
              title="Pilih kategori,"
              accent="klik untuk memperbesar."
              description="Gunakan filter untuk melihat momen tertentu. Tekan Esc atau klik di luar foto untuk menutup."
              align="center"
            />
            <GalleryGrid items={items} />
          </div>
        </section>

        <AdmissionCta title="Foto hanya sebagian kecil ceritanya." description="Datang ke sekolah dan lihat langsung bagaimana anak-anak belajar, bermain, dan bertumbuh setiap hari." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
