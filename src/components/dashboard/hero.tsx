import Link from 'next/link'
import type { ReactNode } from 'react'
import { initials } from '@/components/dashboard/primitives'

// Banner pembuka dashboard, satu gaya per peran — bukan gradasi generik:
// admin = meja kerja + kalender sobek + ilustrasi sekolah sesuai waktu,
// guru = papan tulis kapur berisi agenda hari ini,
// orang tua = halaman buku penghubung bergaris dengan foto polaroid anak.

export type DayPart = 'pagi' | 'siang' | 'sore' | 'malam'

export function dayPart(date: Date): DayPart {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(date))
  if (hour < 11) return 'pagi'
  if (hour < 15) return 'siang'
  if (hour < 18) return 'sore'
  return 'malam'
}

const fmt = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...options }).format(date)

export function HeroButton({ href, children, variant = 'solid', className = '' }: { href: string; children: ReactNode; variant?: 'solid' | 'ghost' | 'chalk' | 'chalk-ghost'; className?: string }) {
  const styles = {
    solid: 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-[var(--primary)]/25 hover:shadow-md',
    ghost: 'border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]',
    chalk: 'bg-[#f4f1e8] text-[#23392f] shadow-sm hover:bg-white',
    'chalk-ghost': 'border border-dashed border-white/45 text-[#f4f1e8] hover:border-white hover:bg-white/5',
  }[variant]
  return (
    <Link href={href} className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-all hover:-translate-y-px [&_svg]:size-4 ${styles} ${className}`}>
      {children}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

/** Ilustrasi gedung TK; langit berganti mengikuti waktu (Asia/Jakarta). */
function SchoolScene({ part }: { part: DayPart }) {
  const sky = {
    pagi: { from: '#fde7c8', to: '#fbf3ff' },
    siang: { from: '#cfe8ff', to: '#f3f8ff' },
    sore: { from: '#ffc9a8', to: '#fbe0ef' },
    malam: { from: '#2b2350', to: '#4a3a7a' },
  }[part]
  const night = part === 'malam'
  return (
    <svg viewBox="0 0 280 170" className="h-auto w-full" role="img" aria-label={`Ilustrasi sekolah di waktu ${part}`}>
      <defs>
        <linearGradient id={`sky-${part}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.from} />
          <stop offset="1" stopColor={sky.to} />
        </linearGradient>
        <clipPath id="scene-clip"><rect width="280" height="170" rx="22" /></clipPath>
      </defs>
      <g clipPath="url(#scene-clip)">
        <rect width="280" height="170" fill={`url(#sky-${part})`} />
        {night ? (
          <>
            <circle cx="222" cy="38" r="15" fill="#fff6d6" />
            <circle cx="229" cy="33" r="13" fill={sky.from} />
            {[[40, 28], [78, 50], [120, 22], [170, 44], [252, 70], [196, 18]].map(([x, y]) => (
              <path key={`${x}-${y}`} d={`M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`} fill="#fff6d6" />
            ))}
          </>
        ) : (
          <>
            <circle cx="222" cy={part === 'sore' ? 64 : 40} r="17" fill={part === 'sore' ? '#fb923c' : '#fbbf24'} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line key={deg} x1="222" y1={part === 'sore' ? 38 : 14} x2="222" y2={part === 'sore' ? 32 : 8} stroke={part === 'sore' ? '#fb923c' : '#fbbf24'} strokeWidth="3" strokeLinecap="round" transform={`rotate(${deg} 222 ${part === 'sore' ? 64 : 40})`} />
            ))}
            <path d="M40 46q0-12 13-12 5-9 16-5 11-2 12 9 10 1 9 9H40z" fill="#fff" opacity=".9" />
            <path d="M128 30q0-8 9-8 4-6 11-3 8-1 8 6 7 1 6 6h-34z" fill="#fff" opacity=".75" />
          </>
        )}
        {/* bukit */}
        <path d="M0 132q70-34 150-8t130-6v52H0z" fill={night ? '#3d6b52' : '#9ad49b'} />
        <path d="M0 148q90-22 170-4t110-4v30H0z" fill={night ? '#2f5a44' : '#7cc486'} />
        {/* gedung */}
        <g transform="translate(86 62)">
          <rect x="8" y="34" width="92" height="52" rx="4" fill={night ? '#efe6f5' : '#fff8ef'} />
          <path d="M0 38 54 4l54 34z" fill="#a64ca6" />
          <rect x="44" y="-18" width="1.8" height="26" fill="#6b4b2a" />
          <path d="M46 -18h16l-4 5 4 5h-16z" fill="#e9a24b" />
          <circle cx="54" cy="24" r="7" fill={night ? '#fde68a' : '#fff'} stroke="#8a3c8a" strokeWidth="1.5" />
          <path d="M54 20v4l3 2" stroke="#8a3c8a" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <rect x="44" y="58" width="20" height="28" rx="10" fill="#8a3c8a" />
          {[[18, 48], [74, 48]].map(([x, y]) => (
            <g key={x}>
              <rect x={x} y={y} width="16" height="16" rx="3" fill={night ? '#fde68a' : '#bfdbfe'} />
              <path d={`M${x + 8} ${y}v16M${x} ${y + 8}h16`} stroke={night ? '#fbbf24' : '#fff'} strokeWidth="1.4" />
            </g>
          ))}
        </g>
        {/* bunga anggrek */}
        <g transform="translate(40 118)">
          <path d="M8 26q2-12 0-20" stroke="#4d7c57" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <g fill="#d17bd0">
            <ellipse cx="2" cy="4" rx="5" ry="3.5" />
            <ellipse cx="14" cy="4" rx="5" ry="3.5" />
            <ellipse cx="8" cy="-2" rx="3.5" ry="5" />
          </g>
          <circle cx="8" cy="4" r="3" fill="#fbbf24" />
        </g>
        <g transform="translate(222 124)">
          <path d="M6 22q1-10 0-16" stroke="#4d7c57" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <g fill="#f9a8d4">
            <circle cx="2" cy="3" r="4" />
            <circle cx="10" cy="3" r="4" />
            <circle cx="6" cy="-2" r="4" />
          </g>
          <circle cx="6" cy="2.5" r="2.4" fill="#fff" />
        </g>
      </g>
    </svg>
  )
}

export function AdminHero({
  now,
  name,
  description,
  actions,
  facts,
}: {
  now: Date
  name: string
  description: ReactNode
  actions: ReactNode
  facts: { label: string; value: ReactNode; tone?: 'default' | 'warning' | 'danger' | 'success' }[]
}) {
  const part = dayPart(now)
  const dot = { default: 'bg-[var(--primary)]', warning: 'bg-amber-500', danger: 'bg-[var(--destructive)]', success: 'bg-emerald-500' }
  return (
    <section className="hero-desk">
      <div className="grid items-center gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_minmax(0,300px)]">
        <div className="tear-calendar hidden sm:block" aria-label={fmt(now, { dateStyle: 'full' })}>
          <div className="tear-calendar-top">{fmt(now, { weekday: 'long' })}</div>
          <p className="pt-2 font-heading text-5xl font-extrabold leading-none tabular-nums text-[var(--foreground)]">{fmt(now, { day: 'numeric' })}</p>
          <p className="pb-4 pt-1.5 text-xs font-semibold capitalize text-[var(--muted-foreground)]">{fmt(now, { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="min-w-0">
          <p className="font-hand text-[1.9rem] leading-none text-[var(--primary)]">Selamat {part},</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="relative inline-block">
              {name}
              <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-[var(--accent)]" aria-hidden="true">
                <path d="M2 7q30-6 58-2t58-1" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
        </div>

        <div className="hidden overflow-hidden rounded-[22px] shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] lg:block">
          <SchoolScene part={part} />
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-dashed border-[var(--border)] px-5 py-3 text-sm sm:px-7">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${dot[fact.tone ?? 'default']}`} aria-hidden="true" />
            <dt className="text-[var(--muted-foreground)]">{fact.label}</dt>
            <dd className="font-semibold tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Guru                                                                */
/* ------------------------------------------------------------------ */

export interface ChalkAgendaItem {
  id: number
  time: string
  activity: string
  state: 'done' | 'now' | 'next'
}

export function TeacherHero({
  now,
  name,
  description,
  agenda,
  actions,
}: {
  now: Date
  name: string
  description: ReactNode
  agenda: ChalkAgendaItem[]
  actions: ReactNode
}) {
  const shown = agenda.slice(0, 5)
  return (
    <section className="chalk-frame">
      <div className="chalkboard">
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-w-0">
            <p className="font-hand chalk-text text-xl text-[#f4f1e8]/75">{fmt(now, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="font-hand chalk-text mt-2 text-[2.6rem] leading-[1.05] sm:text-5xl">
              Selamat bertugas,
              <br />
              <span className="text-[#fde68a]">{name}!</span>
            </h1>
            <svg viewBox="0 0 220 14" className="mt-1 h-3 w-48 text-[#f9a8d4]/80" aria-hidden="true">
              <path d="M3 9q40-8 80-3t80-1q30-2 54 1" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="1 0" />
            </svg>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#f4f1e8]/80">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">{actions}</div>
          </div>

          <div className="relative min-w-0 rounded-2xl border-2 border-dashed border-white/15 p-5">
            <p className="font-hand chalk-text flex items-center gap-2 text-2xl text-[#bae6fd]">
              Agenda hari ini
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.5-4 6-.6z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" /></svg>
            </p>
            {shown.length === 0 ? (
              <p className="font-hand chalk-text mt-4 text-2xl text-[#f4f1e8]/70">Tidak ada jadwal hari ini — waktunya menulis laporan.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {shown.map((item) => (
                  <li key={item.id} className={`font-hand chalk-text flex items-baseline gap-3 text-[1.35rem] leading-snug ${item.state === 'done' ? 'text-[#f4f1e8]/45' : ''}`}>
                    <span className={`w-12 shrink-0 tabular-nums ${item.state === 'now' ? 'text-[#fde68a]' : 'text-[#f4f1e8]/60'}`}>{item.time}</span>
                    <span className={`min-w-0 truncate ${item.state === 'done' ? 'line-through decoration-white/40' : ''} ${item.state === 'now' ? 'text-[#fde68a]' : ''}`}>{item.activity}</span>
                    {item.state === 'now' && <span className="shrink-0 rounded-full border border-[#fde68a]/70 px-2 text-base text-[#fde68a]">sekarang</span>}
                    {item.state === 'done' && <span className="shrink-0 text-[#86efac]/80" aria-label="selesai">✓</span>}
                  </li>
                ))}
                {agenda.length > shown.length && <li className="font-hand text-lg text-[#f4f1e8]/55">+{agenda.length - shown.length} kegiatan lagi…</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="chalk-tray" aria-hidden="true">
        <span className="chalk-stick bg-[#f4f1e8]" />
        <span className="chalk-stick bg-[#fde68a]" />
        <span className="chalk-stick bg-[#f9a8d4]" />
        <span className="chalk-stick bg-[#bae6fd]" />
        <span className="chalk-eraser" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Orang tua                                                           */
/* ------------------------------------------------------------------ */

function CrayonSun({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`pointer-events-none absolute opacity-90 ${className}`} aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="72" cy="46" r="15" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="72" cy="46" r="8" fill="#fcd34d" stroke="none" opacity=".7" />
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
          <path key={deg} d="M72 22v-9" stroke="#f59e0b" strokeWidth="3.5" transform={`rotate(${deg} 72 46)`} />
        ))}
      </g>
    </svg>
  )
}

export function ParentHero({
  now,
  greeting,
  notes,
  kids,
  sticker,
  actions,
}: {
  now: Date
  greeting: string
  notes: ReactNode[]
  kids: { id: number; name: string; className?: string }[]
  sticker: { text: string; tone: 'success' | 'warning' }
  actions: ReactNode
}) {
  const shownKids = kids.slice(0, 2)
  return (
    <section className="notebook">
      <div className="notebook-holes" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => <span key={i} />)}
      </div>
      <CrayonSun className="-right-3 -top-3 size-24 md:hidden" />

      <div className="grid gap-6 py-5 pl-[4.3rem] pr-5 sm:pr-8 md:grid-cols-[1fr_auto]">
        <div className="notebook-lines min-w-0">
          <p className="font-hand text-xl opacity-70">{fmt(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="font-hand text-[2.35rem] font-bold leading-[2rem] text-[var(--primary)] sm:text-[2.7rem]">{greeting}</h1>
          <p className="mt-2 font-hand text-2xl font-semibold">Catatan hari ini:</p>
          <ul className="font-hand text-[1.3rem]">
            {notes.map((note, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-[var(--primary)]" aria-hidden="true">✿</span>
                <span className="min-w-0">{note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 font-sans">{actions}</div>
        </div>

        <div className="relative hidden items-start justify-center pb-6 pr-2 pt-5 md:flex">
          <CrayonSun className="-left-20 -top-4 size-24" />
          {shownKids.map((kid, index) => (
            <figure
              key={kid.id}
              className={`polaroid ${index === 1 ? '-ml-10 mt-6' : ''}`}
              style={{ transform: `rotate(${index === 0 ? 4 : -5}deg)`, zIndex: shownKids.length - index }}
            >
              <div className="grid aspect-square place-items-center bg-[color-mix(in_srgb,#a64ca6_12%,#fff)]">
                <span className="grid size-16 place-items-center rounded-full bg-white font-heading text-xl font-extrabold text-[#a64ca6] shadow-sm">{initials(kid.name)}</span>
              </div>
              <figcaption className="font-hand py-1.5 text-center text-lg leading-tight">
                {kid.name.replace(/\(.*?\)/g, '').trim().split(/\s+/)[0]}
                {kid.className && <span className="block text-sm opacity-60">{kid.className}</span>}
              </figcaption>
            </figure>
          ))}
          <div
            className={`sticker absolute -left-16 top-28 z-10 rotate-[-12deg] ${sticker.tone === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'}`}
          >
            <span className="font-hand text-lg font-bold leading-none">{sticker.text}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
