import Link from 'next/link'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'Kontak — TK Orchid' }

const KONTAK_ITEMS = [
  { icon: '📍', title: 'Alamat', body: 'Kota Bekasi, Jawa Barat. (Alamat lengkap diatur dari menu Pengaturan sekolah.)' },
  { icon: '📞', title: 'Telepon / WhatsApp', body: 'Nomor diatur dari Pengaturan sekolah.' },
  { icon: '✉️', title: 'Email', body: 'info@tk-orchid.sch.id' },
  { icon: '🕒', title: 'Jam Layanan', body: 'Senin – Jumat, 07.30 – 15.00 WIB' },
]

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.hero1} alt="Anak-anak TK Orchid" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            💬 Sapa Kami
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">Hubungi Kami</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 drop-shadow sm:text-lg">
            Ada pertanyaan seputar pendaftaran atau sekolah? Senang membantu Anda.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] px-4 py-16">
        {/* KARTU KONTAK dengan ikon besar */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KONTAK_ITEMS.map((k, i) => (
            <Reveal key={k.title} delay={i * 100}>
            <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-2xl">
                {k.icon}
              </span>
              <h2 className="mt-4 text-sm font-bold uppercase tracking-wide">{k.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{k.body}</p>
            </div>
            </Reveal>
          ))}
        </section>

        {/* CTA DAFTAR — gradasi orchid */}
        <Reveal className="mt-14 block">
        <section className="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#A64CA6] via-[var(--primary)] to-[#7C3AED]" />
          <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-black/15 blur-2xl" />
          <div className="relative">
            <h2 className="text-xl font-bold sm:text-2xl">Ingin mendaftarkan anak Anda?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
              Isi formulir pendaftaran online — tim kami akan segera menghubungi Anda.
            </p>
            <Link
              href="/pendaftaran"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-[#23071F] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Daftar Sekarang <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
        </Reveal>
      </main>
    </div>
  )
}
