import Link from 'next/link'
import { ArrowUpRight, Check, ClipboardPenLine, FileCheck2, Megaphone } from 'lucide-react'
import { db } from '@/lib/db/db'
import { PpdbForm } from '@/components/public/ppdb-form'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'
import { PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { FaqSection } from '@/components/public/school-sections'
import { ageReferenceDate } from '@/lib/ppdb/levels'

export const metadata = { title: 'PPDB Online' }
// Status buka/tutup bergantung tanggal hari ini, jadi selalu dirender per request
export const revalidate = 0

const STEPS = [
  { number: '01', icon: ClipboardPenLine, title: 'Isi formulir', description: 'Lengkapi data orang tua dan calon peserta didik secara online.' },
  { number: '02', icon: FileCheck2, title: 'Siapkan berkas', description: 'Siapkan dokumen persyaratan sesuai petunjuk dari sekolah.' },
  { number: '03', icon: Megaphone, title: 'Tunggu kabar', description: 'Tim sekolah menghubungi Anda melalui kontak yang didaftarkan.' },
]

export default async function PendaftaranPage({ searchParams }: PageProps<'/pendaftaran'>) {
  const { jenjang } = await searchParams
  const period = await db.admissionPeriod.findFirst({ where: { isActive: true } })
  const now = new Date()
  const open = Boolean(period && period.startDate <= now && period.endDate >= now)

  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="05"
        eyebrow={open ? `${period!.name} · dibuka` : 'Informasi pendaftaran'}
        title="Langkah pertama"
        accent="dimulai di sini."
        description={open ? 'Prosesnya singkat dan jelas. Isi formulir dengan tenang, lalu tim sekolah akan mendampingi tahap berikutnya.' : 'Pendaftaran online belum tersedia untuk periode saat ini. Informasi dan persyaratan tetap dapat dipelajari di halaman ini.'}
        image={IMG.galeri2}
        imageAlt="Orang tua dan anak membaca buku bersama"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Alur pendaftaran"
              title="Tiga langkah,"
              accent="tanpa dibuat rumit."
              description="Siapkan data dasar anak dan orang tua. Setelah formulir diterima, tim sekolah akan membantu tahap berikutnya."
              align="center"
            />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delay={index * 90} variant="scale">
              <article className="relative h-full rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-7 shadow-sm sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]"><step.icon className="size-5" /></span>
                  <span className="font-mono text-[10px] tracking-[.17em] text-[var(--muted-foreground)]">{step.number} / 03</span>
                </div>
                <h2 className="mt-8 text-xl font-bold tracking-[-.025em]">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{step.description}</p>
              </article>
              </Reveal>
            ))}
          </div>
          </div>
        </section>

        <section id="formulir" className="school-section soft scroll-mt-20">
        <div className="public-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {!open ? (
              <div className="border-y border-dashed border-[var(--border)] py-14">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[var(--primary)]">Status periode</p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-.04em]">Pendaftaran sedang ditutup.</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">{period ? `Periode ${period.name} berlaku ${period.startDate.toLocaleDateString('id-ID')} sampai ${period.endDate.toLocaleDateString('id-ID')}.` : 'Belum ada periode pendaftaran yang dibuka.'}</p>
                <Link href="/kontak" className="mt-7 inline-flex min-h-12 items-center gap-2 border-b border-[var(--primary)] text-sm font-bold text-[var(--primary)]">Hubungi sekolah <ArrowUpRight className="size-4" /></Link>
              </div>
            ) : (
              <>
                {period!.requirementsText && (
                  <aside className="mb-7 border-l-2 border-[var(--primary)] bg-[var(--secondary)] p-6">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[var(--primary)]">Persyaratan</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted-foreground)]">{period!.requirementsText}</p>
                  </aside>
                )}
                <PpdbForm periodName={period!.name} referenceDate={ageReferenceDate(period!.endDate).toISOString()} defaultLevel={typeof jenjang === 'string' ? jenjang : undefined} />
              </>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <figure className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.programSeni} alt="Anak-anak berekspresi dalam kegiatan sekolah" loading="lazy" className="h-56 w-full object-cover" />
              <figcaption className="p-7">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]">Kenapa Orchid</p>
                <ul className="mt-5 space-y-4 text-sm text-[var(--muted-foreground)]">
                  {['Guru hangat & terlatih STPPA', 'Kelas inklusif penuh kasih', 'Fasilitas aman & bersih', 'Komunikasi erat dengan orang tua'].map((item) => <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /> {item}</li>)}
                </ul>
              </figcaption>
            </figure>
            <div className="rounded-[1.75rem] bg-[var(--primary)] p-7 text-[var(--primary-foreground)]">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] opacity-70">Butuh bantuan?</p>
              <h2 className="mt-4 text-2xl font-bold tracking-[-.03em]">Kami siap menjawab.</h2>
              <p className="mt-3 text-sm leading-7 opacity-80">Hubungi kantor sekolah Senin–Jumat, 07.30–15.00 WIB.</p>
              <Link href="/kontak" className="mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-bold">Hubungi kami <ArrowUpRight className="size-4" /></Link>
            </div>
          </aside>
        </div>
        </section>
        <FaqSection soft={false} />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
