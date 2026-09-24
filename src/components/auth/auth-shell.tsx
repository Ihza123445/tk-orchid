import Link from 'next/link'
import { Flower2, ShieldCheck, Sparkles } from 'lucide-react'

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:p-0">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-[var(--accent)]/15 blur-3xl" />

      <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 bg-[#211020] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(218,112,214,.3),transparent_34%),radial-gradient(circle_at_90%_80%,rgba(240,179,92,.18),transparent_28%)]" />
        <Link href="/" className="relative inline-flex items-center gap-3 font-semibold">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
            <Flower2 className="size-5 text-[#ef9ceb]" />
          </span>
          TK Orchid
        </Link>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            <Sparkles className="size-3.5" /> Portal sekolah terpadu
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Tumbuh bersama, terhubung setiap hari.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
            Satu ruang aman untuk administrasi sekolah, guru, dan orang tua memantau perjalanan belajar anak.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/55">
          <ShieldCheck className="size-4" /> Akses dilindungi sesuai peran pengguna
        </div>
      </section>

      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center lg:min-h-screen lg:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 font-semibold text-[var(--primary)] lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)]/12">
              <Flower2 className="size-4" />
            </span>
            TK Orchid
          </Link>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
          </div>
          {children}
          <p className="mt-7 text-center text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} TK Orchid · Bekasi
          </p>
        </div>
      </section>
    </main>
  )
}
