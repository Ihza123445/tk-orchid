import { Award, GraduationCap, HeartHandshake, Sparkles, UsersRound } from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { PrincipalMessage } from '@/components/public/school-sections'
import { db } from '@/lib/db/db'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'Guru & Staf' }
export const revalidate = 0

const QUALITIES = [
  { icon: GraduationCap, title: 'Berlatar pendidikan PAUD', body: 'Memahami tahap tumbuh kembang dan pendekatan belajar anak usia dini.' },
  { icon: HeartHandshake, title: 'Sabar & hangat', body: 'Membangun rasa aman sebelum mengajak anak mencoba hal baru.' },
  { icon: Award, title: 'Terus belajar', body: 'Mengikuti pelatihan rutin tentang kurikulum, keamanan, dan pendampingan.' },
]

const TONES = ['purple', 'gold', 'pink']

export default async function PendidikPage() {
  const teachers = await db.teacher.findMany({
    where: { isActive: true },
    orderBy: { fullName: 'asc' },
    select: { id: true, fullName: true, specialization: true, education: true, classes: { select: { name: true }, take: 1 } },
  })

  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="07"
        eyebrow="Guru & staf"
        title="Orang dewasa yang"
        accent="anak percayai."
        description="Tim pendidik TK Orchid adalah pendamping pertama si kecil di sekolah: mengenal namanya, memahami perasaannya, dan merayakan setiap kemajuannya."
        image={IMG.programTematik}
        imageAlt="Guru mendampingi anak belajar"
      />

      <main id="main-content">
        <PrincipalMessage />

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Tim pendidik"
              title="Kenali para"
              accent="pendamping si kecil."
              description="Setiap kelas didampingi wali kelas dan guru pendamping agar perhatian untuk anak tetap personal."
              align="center"
            />
            {teachers.length ? (
              <div className="school-teacher-grid">
                {teachers.map((teacher, index) => {
                  const initials = teacher.fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
                  return (
                    <Reveal key={teacher.id} delay={(index % 4) * 80} variant="scale">
                      <article className={`school-teacher-card ${TONES[index % TONES.length]}`}>
                        <span className="school-teacher-avatar" aria-hidden="true">{initials}</span>
                        <h3>{teacher.fullName}</h3>
                        <p className="school-teacher-role">{teacher.classes[0] ? `Wali kelas ${teacher.classes[0].name}` : 'Guru pendamping'}</p>
                        {teacher.specialization && <p className="school-teacher-meta"><Sparkles /> {teacher.specialization}</p>}
                        {teacher.education && <p className="school-teacher-meta"><GraduationCap /> {teacher.education}</p>}
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            ) : (
              <p className="school-empty mt-12"><UsersRound className="mx-auto mb-3 size-7 text-[var(--primary)]" />Profil tim pendidik akan segera ditampilkan.</p>
            )}
          </div>
        </section>

        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Standar kami"
              title="Yang kami cari dari"
              accent="setiap pendidik."
              align="center"
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {QUALITIES.map((item, index) => (
                <Reveal key={item.title} delay={index * 100} variant="up">
                  <article className="school-value-card h-full">
                    <span><item.icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <i aria-hidden="true" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <AdmissionCta title="Bertemu langsung dengan guru-guru kami." description="Jadwalkan kunjungan dan trial class agar si kecil bisa berkenalan lebih dulu dengan calon gurunya." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
