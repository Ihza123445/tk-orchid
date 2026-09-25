import { BookHeart, House, NotebookPen } from 'lucide-react'
import { formatTanggalSingkat } from '@/lib/formatting/format'

// Warna skala STPPA: BB → MB → BSH → BSB (makin tinggi makin "matang")
export const SCALE_STYLE: Record<string, string> = {
  BB: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  MB: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  BSH: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  BSB: 'bg-[var(--primary)]/10 text-[var(--primary)] ring-[var(--primary)]/20',
}

export interface ReportCardData {
  id: number
  period: string
  publishedAt: Date | null
  summary: string | null
  homeRecommendation: string | null
  attendanceSummary?: string | null
  items: { id: number; narrative: string | null; domain: { name: string }; scale: { code: string; label: string } }[]
}

export function ScaleLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
      <span className="font-medium">Skala:</span>
      {[
        ['BB', 'Belum Berkembang'],
        ['MB', 'Mulai Berkembang'],
        ['BSH', 'Berkembang Sesuai Harapan'],
        ['BSB', 'Berkembang Sangat Baik'],
      ].map(([code, label]) => (
        <span key={code} className="inline-flex items-center gap-1.5">
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${SCALE_STYLE[code]}`}>{code}</span>
          {label}
        </span>
      ))}
    </div>
  )
}

/** Kartu rapor perkembangan yang sudah terbit (tampilan orang tua). */
export function ReportCard({ report }: { report: ReportCardData }) {
  return (
    <article className="app-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><BookHeart className="size-[18px]" /></span>
          <div>
            <h3 className="font-heading font-bold">{report.period}</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Terbit {report.publishedAt ? formatTanggalSingkat(report.publishedAt) : '-'}</p>
          </div>
        </div>
        {report.attendanceSummary && <p className="text-xs text-[var(--muted-foreground)]">{report.attendanceSummary}</p>}
      </div>
      <div className="space-y-4 p-5">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {report.items.map((item) => (
            <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{item.domain.name}</span>
                <span title={item.scale.label} className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${SCALE_STYLE[item.scale.code] ?? 'bg-[var(--muted)] ring-[var(--border)]'}`}>{item.scale.code}</span>
              </div>
              {item.narrative && <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{item.narrative}</p>}
            </li>
          ))}
        </ul>
        {(report.summary || report.homeRecommendation) && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {report.summary && (
              <div className="rounded-xl bg-[var(--primary)]/[0.06] p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"><NotebookPen className="size-3.5" /> Catatan guru</p>
                <p className="mt-1.5 text-sm leading-relaxed">{report.summary}</p>
              </div>
            )}
            {report.homeRecommendation && (
              <div className="rounded-xl bg-emerald-500/[0.07] p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><House className="size-3.5" /> Stimulasi di rumah</p>
                <p className="mt-1.5 text-sm leading-relaxed">{report.homeRecommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
