import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { FaqAccordion } from '@/components/public/faq-accordion'
import { PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { IMG } from '@/lib/assets/public-images'
import { whatsappLink } from '@/lib/content/public-content'
import { getFaqs, getSiteSettings } from '@/lib/cms/content'
import { toFaqItem } from '@/components/public/school-sections'

export const metadata = { title: 'Tanya Jawab' }

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSiteSettings()])
  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="08"
        eyebrow="Tanya jawab"
        title="Ada pertanyaan?"
        accent="Kami bantu jawab."
        description="Kumpulan pertanyaan yang paling sering diajukan keluarga tentang pendaftaran, pembelajaran, dan kehidupan sehari-hari di TK Orchid."
        image={IMG.programTematik}
        imageAlt="Guru mendampingi anak belajar"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container school-faq-grid">
            <div>
              <SectionHeading
                eyebrow="Pusat informasi"
                title="Cari jawaban"
                accent="dengan cepat."
                description="Ketik kata kunci atau pilih kategori. Jika jawabannya belum ada, tim sekolah siap membantu."
              />
              <Reveal className="school-faq-help">
                <MessageCircle />
                <strong>Masih bingung?</strong>
                <p>Tanyakan langsung kepada tim admisi melalui WhatsApp pada jam layanan sekolah.</p>
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="school-pill-button">Chat WhatsApp <ArrowRight /></a>
                <Link href="/kontak" className="school-text-link">Kontak lainnya <ArrowRight /></Link>
              </Reveal>
            </div>
            <Reveal variant="right">
              <FaqAccordion items={faqs.map(toFaqItem)} filterable />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
