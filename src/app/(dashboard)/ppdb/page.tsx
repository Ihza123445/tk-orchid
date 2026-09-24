import Link from 'next/link'
import { Cake, CalendarRange, ClipboardList, Mail, MapPin, MessageSquareText, Phone, School, UserRound } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { AdmissionReviewForm } from '@/components/admissions/review-form'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { Stat, StatGroup } from '@/components/dashboard/primitives'
import { LEVELS, ageAt, ageReferenceDate, findLevel, formatAge, levelForAge } from '@/lib/ppdb/levels'

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Baru masuk',
  REVIEW: 'Ditinjau',
  REVISION_REQUIRED: 'Perlu revisi',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  ENROLLED: 'Sudah menjadi siswa',
}

const STATUS_STYLE: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  REVIEW: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  REVISION_REQUIRED: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  REJECTED: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  ENROLLED: 'bg-[var(--secondary)] text-[var(--primary)]',
}

const RELATION_LABEL: Record<string, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali' }
const PENDING = ['SUBMITTED', 'REVIEW', 'REVISION_REQUIRED']

export const metadata = { title: 'Pendaftaran PPDB' }

type Filters = { periode?: string; jenjang?: string; status?: string }

function filterHref(current: Filters, patch: Filters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...patch })) if (value) params.set(key, value)
  const query = params.toString()
  return query ? `/ppdb?${query}` : '/ppdb'
}

export default async function PpdbAdminPage({ searchParams }: PageProps<'/ppdb'>) {
  await requireAdminStaff()
  const raw = await searchParams
  const pick = (key: string) => (typeof raw[key] === 'string' ? (raw[key] as string) : undefined)

  const periods = await db.admissionPeriod.findMany({ orderBy: { startDate: 'desc' } })
  const activePeriod = periods.find((period) => period.isActive)
  // Default: periode aktif (atau terbaru). "semua" menampilkan semua periode.
  const periodParam = pick('periode') ?? String(activePeriod?.id ?? periods[0]?.id ?? 'semua')
  const periodId = periodParam === 'semua' ? undefined : Number(periodParam)
  const filters: Filters = { periode: periodParam, jenjang: pick('jenjang'), status: pick('status') }
  const level = findLevel(filters.jenjang)

  const inPeriod = await db.admission.findMany({
    where: periodId ? { admissionPeriodId: periodId } : {},
    include: { period: { select: { name: true, endDate: true } } },
    orderBy: [{ createdAt: 'desc' }],
  })
  const admissions = inPeriod.filter((item) =>
    (!level || item.preferredLevel === level.value) &&
    (!filters.status || (filters.status === 'pending' ? PENDING.includes(item.status) : item.status === filters.status)),
  )

  const pending = inPeriod.filter((item) => PENDING.includes(item.status)).length
  const levelCounts = Object.fromEntries(LEVELS.map((item) => [item.value, inPeriod.filter((row) => row.preferredLevel === item.value).length]))
  const chip = (active: boolean) =>
    `inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 text-xs transition-colors ${active ? 'bg-[var(--card)] font-medium text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Penerimaan siswa</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pendaftaran PPDB</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Tinjau pendaftaran online dan perbarui status calon siswa.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/website/ppdb" className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-[var(--muted)]">
            <CalendarRange className="size-4" /> Atur periode
          </Link>
          {pending > 0 && (
            <Link href={filterHref(filters, { status: 'pending' })} className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500/10 px-4 text-sm font-medium text-amber-800 hover:bg-amber-500/15 dark:text-amber-200">
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" /> {pending} perlu ditindaklanjuti
            </Link>
          )}
        </div>
      </header>

      <StatGroup columns={3}>
        {LEVELS.map((item) => (
          <Stat
            key={item.value}
            label={item.label}
            value={levelCounts[item.value]}
            hint={level?.value === item.value ? 'Filter aktif · klik untuk menghapus' : `pendaftar · usia ${item.minAge}${item.maxAge - item.minAge > 1 ? `–${item.maxAge - 1}` : ''} th`}
            tone={level?.value === item.value ? 'success' : 'default'}
            href={filterHref(filters, { jenjang: level?.value === item.value ? undefined : item.slug })}
          />
        ))}
      </StatGroup>

      <div className="space-y-2">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1">
          <span className="shrink-0 px-2 text-xs text-[var(--muted-foreground)]">Periode</span>
          {periods.map((period) => (
            <Link key={period.id} href={filterHref(filters, { periode: String(period.id) })} className={chip(periodId === period.id)}>
              {period.name}{period.isActive && ' · aktif'}
            </Link>
          ))}
          <Link href={filterHref(filters, { periode: 'semua' })} className={chip(!periodId)}>Semua periode</Link>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1">
          <span className="shrink-0 px-2 text-xs text-[var(--muted-foreground)]">Status</span>
          <Link href={filterHref(filters, { status: undefined })} className={chip(!filters.status)}>Semua</Link>
          <Link href={filterHref(filters, { status: 'pending' })} className={chip(filters.status === 'pending')}>Perlu tindak lanjut</Link>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <Link key={value} href={filterHref(filters, { status: value })} className={chip(filters.status === value)}>{label}</Link>
          ))}
        </div>
      </div>

      {admissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <ClipboardList className="mx-auto size-8 text-[var(--muted-foreground)]" />
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{inPeriod.length ? 'Tidak ada pendaftar yang cocok dengan filter.' : 'Belum ada pendaftaran online untuk periode ini.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {admissions.map((item) => {
            const reference = ageReferenceDate(item.period.endDate)
            const age = ageAt(item.studentBirthDate, reference)
            const chosen = findLevel(item.preferredLevel)
            const suitable = levelForAge(age.years)
            const ageWarning = !suitable ? 'Usia di luar rentang penerimaan' : chosen && suitable.value !== chosen.value ? `Usia lebih sesuai untuk ${suitable.label}` : null
            return (
              <article key={item.id} className="rounded-2xl border bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-[var(--muted-foreground)]">{item.applicationNo}</p>
                    <h2 className="mt-1 font-heading text-lg font-semibold">{item.studentFullName}</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">{item.period.name} · masuk {formatTanggalSingkat(item.submittedAt ?? item.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[item.status] ?? 'bg-[var(--muted)]'}`}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[var(--secondary)] px-2.5 py-1 font-semibold text-[var(--primary)]">{chosen?.label ?? item.preferredLevel ?? 'Jenjang belum dipilih'}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-1">
                    <Cake className="size-3.5" /> {item.studentGender === 'L' ? 'Laki-laki' : 'Perempuan'} · {formatAge(age)} per {formatTanggalSingkat(reference)}
                  </span>
                  {ageWarning && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700 dark:text-amber-300">{ageWarning}</span>}
                </div>

                <dl className="mt-3 grid gap-2 rounded-xl bg-[var(--muted)] p-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2"><UserRound className="size-4 shrink-0 text-[var(--primary)]" /> {item.guardianName} ({RELATION_LABEL[item.guardianRelationship] ?? item.guardianRelationship})</div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-[var(--primary)]" />
                    <a className="hover:underline" href={`https://wa.me/${item.guardianPhone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer">{item.guardianPhone}</a>
                  </div>
                  <div className="flex items-center gap-2"><Cake className="size-4 shrink-0 text-[var(--primary)]" /> {item.studentBirthPlace ? `${item.studentBirthPlace}, ` : ''}{formatTanggalSingkat(item.studentBirthDate)}</div>
                  {item.guardianEmail && <div className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-[var(--primary)]" /> <span className="truncate">{item.guardianEmail}</span></div>}
                  {item.previousSchool && <div className="flex items-center gap-2"><School className="size-4 shrink-0 text-[var(--primary)]" /> {item.previousSchool}</div>}
                  {item.guardianAddress && <div className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /> {item.guardianAddress}</div>}
                  {item.notes && <div className="flex items-start gap-2 sm:col-span-2"><MessageSquareText className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /> {item.notes}</div>}
                </dl>

                {item.rejectionReason && <p className="mt-3 text-xs text-[var(--destructive)]">Alasan: {item.rejectionReason}</p>}

                {item.status !== 'ENROLLED' && <AdmissionReviewForm key={item.status} id={item.id} status={item.status} />}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
