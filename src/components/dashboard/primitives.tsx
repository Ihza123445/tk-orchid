import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

// Primitif dashboard yang tenang: satu wadah bersekat untuk statistik, panel berbingkai tipis
// dengan baris bergaris pemisah — bukan tumpukan kartu berikon di dalam kartu.

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium text-[var(--muted-foreground)]">{eyebrow}</p>}
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function HeaderButton({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors [&_svg]:size-4 ${
        primary ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90' : 'border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
      }`}
    >
      {children}
    </Link>
  )
}

/** Satu wadah untuk beberapa angka ringkas, dipisah garis tipis (gap-px di atas warna border). */
export function StatGroup({ children, columns = 4 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'grid-cols-2 xl:grid-cols-4' }[columns]
  return (
    <div className={`grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] ${cols} [&>*]:bg-[var(--card)]`}>
      {children}
    </div>
  )
}

export function Stat({ label, value, hint, tone = 'default', href }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'default' | 'warning' | 'danger' | 'success'; href?: string }) {
  const dot = { default: '', warning: 'bg-amber-500', danger: 'bg-[var(--destructive)]', success: 'bg-emerald-500' }[tone]
  const body = (
    <>
      <p className="text-[13px] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1.5 font-heading text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          {dot && <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />}
          {hint}
        </p>
      )}
    </>
  )
  return href ? (
    <Link href={href} className="group block p-4 transition-colors hover:!bg-[var(--muted)] sm:p-5">{body}</Link>
  ) : (
    <div className="p-4 sm:p-5">{body}</div>
  )
}

export function Panel({
  title,
  description,
  action,
  children,
  className = '',
  flush = false,
}: {
  title: string
  description?: string
  action?: { href: string; label: string }
  children: ReactNode
  className?: string
  /** true = konten tanpa padding (untuk daftar baris) */
  flush?: boolean
}) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>}
        </div>
        {action && (
          <Link href={action.href} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
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

export function Row({ primary, secondary, trailing, href }: { primary: ReactNode; secondary?: ReactNode; trailing?: ReactNode; href?: string }) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{primary}</p>
        {secondary && <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{secondary}</p>}
      </div>
      {trailing && <div className="shrink-0 text-right text-sm">{trailing}</div>}
      {href && <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />}
    </>
  )
  return (
    <li>
      {href ? (
        <Link href={href} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--muted)]/60">{content}</Link>
      ) : (
        <div className="flex items-center gap-3 px-5 py-3">{content}</div>
      )}
    </li>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">{children}</p>
}

const PILL = {
  neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  danger: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  brand: 'bg-[var(--secondary)] text-[var(--primary)]',
}

export function Pill({ tone = 'neutral', children }: { tone?: keyof typeof PILL; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${PILL[tone]}`}>{children}</span>
}

export const ADMISSION_STATUS: Record<string, { label: string; tone: keyof typeof PILL }> = {
  SUBMITTED: { label: 'Baru', tone: 'info' },
  REVIEW: { label: 'Ditinjau', tone: 'warning' },
  REVISION_REQUIRED: { label: 'Perlu revisi', tone: 'warning' },
  ACCEPTED: { label: 'Diterima', tone: 'success' },
  REJECTED: { label: 'Ditolak', tone: 'danger' },
  ENROLLED: { label: 'Jadi siswa', tone: 'brand' },
}
