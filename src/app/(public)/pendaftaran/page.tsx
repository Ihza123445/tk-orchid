import Link from 'next/link'
import { db } from '@/lib/db/db'
import { PpdbForm } from '@/components/public/ppdb-form'
import { SiteHeader } from '@/components/public/site-header'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'PPDB Online — TK Orchid' }

export default async function PendaftaranPage() {
  const period = await db.admissionPeriod.findFirst({ where: { isActive: true } })
  const now = new Date()
  const open = Boolean(period && period.startDate <= now && period.endDate >= now)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {/* HERO — ala beranda */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.hero2} alt="Anak bermain balok warna" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/35" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            🎒 PPDB 2026/2027 Dibuka
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">
            Penerimaan Peserta Didik Baru
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 drop-shadow sm:text-lg">
            Proses pendaftaran mudah, cepat, dan sepenuhnya online.
          </p>
        </div>
      </section>

      {/* ALUR 3 LANGKAH */}
      <main className="mx-auto max-w-[1100px] px-4 py-16">
        <section className="grid gap-7 md:grid-cols-3">
          {[
            { n: '1', icon: '📝', title: 'Isi Formulir', desc: 'Lengkapi data orang tua dan calon peserta didik secara online.' },
            { n: '2', icon: '📄', title: 'Siapkan Berkas', desc: 'Unggah atau bawa dokumen persyaratan sesuai petunjuk.' },
            { n: '3', icon: '🎉', title: 'Diumumkan', desc: 'Hasil seleksi diumumkan melalui kontak yang Anda daftarkan.' },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span aria-hidden="true" className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] font-heading text-base font-bold text-[var(--primary-foreground)] shadow-md">
                {s.n}
              </span>
              <span aria-hidden="true" className="mt-2 block text-3xl">{s.icon}</span>
              <h2 className="mt-3 font-bold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{s.desc}</p>
            </div>
          ))}
        </section>

        {/* FORM AREA */}
        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            {!open ? (
              <div className="rounded-2xl border border-dashed p-12 text-center">
                <span aria-hidden="true" className="text-4xl">⏳</span>
                <h2 className="mt-4 font-bold">Pendaftaran Sedang Ditutup</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {period
                    ? `Periode ${period.name} berlaku ${period.startDate.toLocaleDateString('id-ID')} s.d. ${period.endDate.toLocaleDateString('id-ID')}.`
                    : 'Belum ada periode pendaftaran yang dibuka.'}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Silakan hubungi kantor sekolah untuk informasi lebih lanjut.</p>
                <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[var(--primary)] underline underline-offset-4">Kembali ke beranda</Link>
              </div>
            ) : (
              <>
                {period!.requirementsText && (
                  <aside className="mb-7 flex gap-4 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-5">
                    <span aria-hidden="true" className="text-2xl">📋</span>
                    <div>
                      <h2 className="font-bold">Persyaratan</h2>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[var(--muted-foreground)]">{period!.requirementsText}</p>
                    </div>
                  </aside>
                )}
                <PpdbForm periodName={period!.name} />
              </>
            )}
          </div>

          {/* SIDEBAR INFO — sticky ala landing page */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.galeri2} alt="Ibu dan anak membaca buku" loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-6">
                <h2 className="font-bold">Kenapa TK Orchid?</h2>
                <ul className="mt-3 space-y-2.5 text-sm text-[var(--muted-foreground)]">
                  {['Guru hangat & terlatih STPPA', 'Kelas inklusif penuh kasih', 'Fasilitas aman & bersih', 'Komunikasi erat dengan orang tua'].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-0.5 text-[var(--primary)]">✓</span> {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#A64CA6] to-[#7C3AED] p-6 text-white shadow-lg">
              <h2 className="font-bold">Butuh bantuan?</h2>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Hubungi kantor kami Senin–Jumat, 07.30–15.00 WIB. Kami dengan senang hati menjawab pertanyaan Anda.
              </p>
              <Link href="/kontak" className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#23071F] transition-transform duration-300 hover:-translate-y-0.5">
                Hubungi Kami →
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
