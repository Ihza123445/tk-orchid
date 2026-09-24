import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// Primitif UI area setelah login. Pola mengikuti "dashboard shell" ala shadcn/ui:
// header halaman berikon, kartu statistik terpisah, panel berbingkai dengan baris
// bergaris pemisah, tabel data, badge status berbahasa Indonesia, dan empty state.

type Tone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const TONE_TILE: Record<Tone, string> = {
  brand: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
  danger: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
}

export function IconTile({ icon: Icon, tone = 'brand', size = 'md' }: { icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-8 rounded-lg [&_svg]:size-4', md: 'size-10 rounded-xl [&_svg]:size-[18px]', lg: 'size-12 rounded-2xl [&_svg]:size-5' }[size]
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${TONE_TILE[tone]}`} aria-hidden="true">
      <Icon />
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  back,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: LucideIcon
  back?: { href: string; label: string }
}) {
  const Icon = icon
  return (
    <header className="space-y-3">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
          <ArrowLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {Icon && (
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--primary)] shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] sm:flex">
              <Icon className="size-[22px]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">{eyebrow}</p>}
            <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function HeaderButton({ href, children, primary = false, external = false }: { href: string; children: ReactNode; primary?: boolean; external?: boolean }) {
  const className = `inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium transition-all [&_svg]:size-4 ${
    primary
      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-[var(--primary)]/25 hover:-translate-y-px hover:shadow-md hover:shadow-[var(--primary)]/25'
      : 'border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]'
  }`
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  )
}

/** Grid kartu statistik. */
export function StatGroup({ children, columns = 4 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const cols = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3', 4: 'grid-cols-2 xl:grid-cols-4' }[columns]
  return <div className={`grid gap-3 sm:gap-4 ${cols}`}>{children}</div>
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
  href,
  icon,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'warning' | 'danger' | 'success'
  href?: string
  icon?: LucideIcon
}) {
  const tileTone: Tone = tone === 'default' ? 'brand' : tone
  const dot = { default: '', warning: 'bg-amber-500', danger: 'bg-[var(--destructive)]', success: 'bg-emerald-500' }[tone]
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[var(--muted-foreground)]">{label}</p>
        {icon && <IconTile icon={icon} tone={tileTone} size="sm" />}
      </div>
      <p className="mt-2 truncate font-heading text-[1.3rem] font-bold leading-tight tabular-nums tracking-tight sm:text-[1.7rem]">{value}</p>
      {hint && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          {dot && <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />}
          <span className="truncate">{hint}</span>
        </p>
      )}
      {href && <ArrowRight className="absolute bottom-4 right-4 size-4 -translate-x-1 text-[var(--primary)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />}
    </>
  )
  const base = 'app-card group relative block min-w-0 p-4 sm:p-5'
  return href ? (
    <Link href={href} className={`${base} transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-raised)]`}>{body}</Link>
  ) : (
    <div className={base}>{body}</div>
  )
}

export function Panel({
  title,
  description,
  action,
  children,
  className = '',
  flush = false,
  icon,
}: {
  title: ReactNode
  description?: ReactNode
  action?: { href: string; label: string }
  children: ReactNode
  className?: string
  /** true = konten tanpa padding (untuk daftar baris) */
  flush?: boolean
  icon?: LucideIcon
}) {
  return (
    <section className={`app-card flex min-w-0 flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <IconTile icon={icon} size="sm" />}
          <div className="min-w-0">
            <h2 className="font-heading text-[0.95rem] font-semibold">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>}
          </div>
        </div>
        {action && (
          <Link href={action.href} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10">
            {action.label} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className={`flex-1 ${flush ? '' : 'p-5'}`}>{children}</div>
    </section>
  )
}

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-[var(--border)]">{children}</ul>
}

export function Row({ primary, secondary, trailing, href, leading }: { primary: ReactNode; secondary?: ReactNode; trailing?: ReactNode; href?: string; leading?: ReactNode }) {
  const content = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{primary}</p>
        {secondary && <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{secondary}</p>}
      </div>
      {trailing && <div className="shrink-0 text-right text-sm">{trailing}</div>}
      {href && <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />}
    </>
  )
  return (
    <li>
      {href ? (
        <Link href={href} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--primary)]/[0.04]">{content}</Link>
      ) : (
        <div className="flex items-center gap-3 px-5 py-3">{content}</div>
      )}
    </li>
  )
}

export function Empty({ children, icon: Icon = Inbox }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-[var(--muted-foreground)]">
      <span className="flex size-10 items-center justify-center rounded-full bg-[var(--muted)]"><Icon className="size-[18px]" aria-hidden="true" /></span>
      {children}
    </div>
  )
}

/** Empty state besar untuk halaman / daftar kosong. */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]"><Icon className="size-5" aria-hidden="true" /></span>
      <p className="mt-1 font-heading text-base font-semibold text-[var(--foreground)]">{title}</p>
      {description && <p className="max-w-md">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Judul bagian di atas tabel/daftar. */
export function SectionHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

/** Wadah bilah filter/pencarian. */
export function Toolbar({ children, action }: { children: ReactNode; action?: string }) {
  return (
    <form action={action} className="app-card flex flex-wrap items-center gap-2 p-2.5">
      {children}
    </form>
  )
}

export function Pagination({ page, totalPages, total, hrefFor }: { page: number; totalPages: number; total?: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null
  const btn = 'inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs font-medium transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]'
  const disabled = 'inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 text-xs font-medium opacity-40'
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Navigasi halaman">
      <p className="text-xs text-[var(--muted-foreground)]">
        Halaman <span className="font-semibold text-[var(--foreground)]">{page}</span> dari {totalPages}
        {total !== undefined && <> · {total} data</>}
      </p>
      <div className="flex gap-2">
        {page > 1 ? <Link href={hrefFor(page - 1)} className={btn}><ChevronLeft className="size-3.5" /> Sebelumnya</Link> : <span className={disabled}><ChevronLeft className="size-3.5" /> Sebelumnya</span>}
        {page < totalPages ? <Link href={hrefFor(page + 1)} className={btn}>Berikutnya <ChevronRight className="size-3.5" /></Link> : <span className={disabled}>Berikutnya <ChevronRight className="size-3.5" /></span>}
      </div>
    </nav>
  )
}

/** Daftar label–nilai untuk halaman detail. */
export function InfoGrid({ items, columns = 2 }: { items: { label: string; value: ReactNode; wide?: boolean }[]; columns?: 1 | 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-8 gap-y-4 text-sm ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((item) => (
        <div key={item.label} className={item.wide && columns === 2 ? 'sm:col-span-2' : ''}>
          <dt className="text-xs font-medium text-[var(--muted-foreground)]">{item.label}</dt>
          <dd className="mt-1 font-medium">{item.value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}

const AVATAR_TONES = [
  'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300',
  'bg-violet-500/12 text-violet-700 dark:text-violet-300',
  'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/12 text-rose-700 dark:text-rose-300',
]

export function initials(name: string) {
  const words = name.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() || '?'
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const tone = AVATAR_TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length]
  const box = { sm: 'size-8 text-[11px]', md: 'size-9 text-xs', lg: 'size-12 text-sm', xl: 'size-16 text-lg' }[size]
  return <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${box} ${tone}`} aria-hidden="true">{initials(name)}</span>
}

/** Bagian nama tanpa sufiks "(DEMO)" untuk sapaan. */
export function firstName(name: string) {
  return name.replace(/\(.*?\)/g, '').trim().split(/\s+/)[0] ?? name
}

const PILL = {
  neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)] ring-[var(--border)]',
  info: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  danger: 'bg-[var(--destructive)]/10 text-[var(--destructive)] ring-[var(--destructive)]/20',
  brand: 'bg-[var(--primary)]/10 text-[var(--primary)] ring-[var(--primary)]/20',
}

const PILL_DOT = {
  neutral: 'bg-[var(--muted-foreground)]',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  danger: 'bg-[var(--destructive)]',
  brand: 'bg-[var(--primary)]',
}

export type PillTone = keyof typeof PILL

export function Pill({ tone = 'neutral', children, dot = false }: { tone?: PillTone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${PILL[tone]}`}>
      {dot && <span className={`size-1.5 rounded-full ${PILL_DOT[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  )
}

type StatusMap = Record<string, { label: string; tone: PillTone }>

export const ADMISSION_STATUS: StatusMap = {
  DRAFT: { label: 'Draf', tone: 'neutral' },
  SUBMITTED: { label: 'Baru', tone: 'info' },
  REVIEW: { label: 'Ditinjau', tone: 'warning' },
  REVISION_REQUIRED: { label: 'Perlu revisi', tone: 'warning' },
  ACCEPTED: { label: 'Diterima', tone: 'success' },
  REJECTED: { label: 'Ditolak', tone: 'danger' },
  ENROLLED: { label: 'Jadi siswa', tone: 'brand' },
}

export const INVOICE_STATUS: StatusMap = {
  DRAFT: { label: 'Draf', tone: 'neutral' },
  ISSUED: { label: 'Belum dibayar', tone: 'info' },
  PARTIAL: { label: 'Dibayar sebagian', tone: 'warning' },
  PAID: { label: 'Lunas', tone: 'success' },
  OVERDUE: { label: 'Lewat jatuh tempo', tone: 'danger' },
  VOID: { label: 'Dibatalkan', tone: 'neutral' },
}

export const LEDGER_STATUS: StatusMap = {
  DRAFT: { label: 'Draf', tone: 'neutral' },
  POSTED: { label: 'Tercatat', tone: 'success' },
  VOID: { label: 'Dibatalkan', tone: 'danger' },
}

export const REPORT_STATUS: StatusMap = {
  DRAFT: { label: 'Draf', tone: 'neutral' },
  REVIEW: { label: 'Menunggu review', tone: 'warning' },
  PUBLISHED: { label: 'Terbit', tone: 'success' },
}

export const STUDENT_STATUS: StatusMap = {
  CANDIDATE: { label: 'Kandidat', tone: 'info' },
  ACTIVE: { label: 'Aktif', tone: 'success' },
  INACTIVE: { label: 'Nonaktif', tone: 'neutral' },
  GRADUATED: { label: 'Lulus', tone: 'brand' },
  TRANSFERRED: { label: 'Pindah', tone: 'warning' },
  WITHDRAWN: { label: 'Keluar', tone: 'danger' },
  COMPLETED: { label: 'Selesai', tone: 'brand' },
}

export const ATTENDANCE_STATUS: StatusMap = {
  PRESENT: { label: 'Hadir', tone: 'success' },
  SICK: { label: 'Sakit', tone: 'warning' },
  PERMISSION: { label: 'Izin', tone: 'info' },
  ABSENT: { label: 'Alpa', tone: 'danger' },
}

export const YEAR_STATUS: StatusMap = {
  PLANNED: { label: 'Perencanaan', tone: 'info' },
  ACTIVE: { label: 'Aktif', tone: 'success' },
  CLOSED: { label: 'Selesai', tone: 'neutral' },
}

export function StatusPill({ map, status }: { map: StatusMap; status: string }) {
  const item = map[status] ?? { label: status, tone: 'neutral' as const }
  return <Pill tone={item.tone} dot>{item.label}</Pill>
}

/** Bilah progres sederhana (mis. kapasitas kelas, kehadiran). */
export function Progress({ value, tone = 'brand', label }: { value: number; tone?: 'brand' | 'success' | 'warning' | 'danger'; label?: string }) {
  const color = { brand: 'bg-[var(--primary)]', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-[var(--destructive)]' }[tone]
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Banner sambutan bergradasi untuk dashboard. */
export function WelcomeBanner({ eyebrow, title, description, actions, aside }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="welcome-banner">
      <div className="welcome-banner-dots" aria-hidden="true" />
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-xl">
          {eyebrow && <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">{eyebrow}</p>}
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm leading-relaxed text-white/80">{description}</p>}
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
        {aside}
      </div>
    </section>
  )
}

export function BannerButton({ href, children, solid = false }: { href: string; children: ReactNode; solid?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-all hover:-translate-y-px [&_svg]:size-4 ${
        solid ? 'bg-white text-[#7a2f86] shadow-lg shadow-black/10 hover:shadow-xl' : 'bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25'
      }`}
    >
      {children}
    </Link>
  )
}

/** Petak pintasan (quick actions). */
export function QuickLinks({ items, columns = 4 }: { items: { href: string; label: string; description?: string; icon: LucideIcon; tone?: Tone }[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' }[columns]
  return (
    <div className={`grid gap-3 ${cols}`}>
      {items.map((item) => (
        <Link key={item.href + item.label} href={item.href} className="app-card group flex items-center gap-3 p-3.5 transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-raised)]">
          <IconTile icon={item.icon} tone={item.tone ?? 'brand'} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{item.label}</span>
            {item.description && <span className="block truncate text-xs text-[var(--muted-foreground)]">{item.description}</span>}
          </span>
        </Link>
      ))}
    </div>
  )
}
