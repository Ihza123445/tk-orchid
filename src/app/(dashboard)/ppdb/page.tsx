import Link from 'next/link'
import { Cake, CalendarRange, ClipboardList, Mail, MapPin, MessageSquareText, Phone, School, UserRound } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { AdmissionReviewForm } from '@/components/admissions/review-form'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { ADMISSION_STATUS, Avatar, EmptyState, HeaderButton, PageHeader, Pill, Stat, StatGroup, StatusPill } from '@/components/dashboard/primitives'
import { LEVELS, ageAt, ageReferenceDate, findLevel, formatAge, levelForAge } from '@/lib/ppdb/levels'

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Baru masuk',
  REVIEW: 'Ditinjau',
  REVISION_REQUIRED: 'Perlu revisi',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  ENROLLED: 'Sudah menjadi siswa',
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
    `inline-flex h-8 items-center whitespace-nowrap rounded-lg px-3 text-xs transition-all ${active ? 'bg-[var(--card)] font-semibold text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--card)]/60 hover:text-[var(--foreground)]'}`

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        eyebrow="Penerimaan siswa"
        title="Pendaftaran PPDB"
        description="Tinjau pendaftaran online dan perbarui status calon siswa."
        actions={
          <>
            {pending > 0 && (
              <Link href={filterHref(filters, { status: 'pending' })} className="inline-flex h-9 items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-500/25 transition-colors hover:bg-amber-500/15 dark:text-amber-200">
                <span className="size-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" /> {pending} perlu ditindaklanjuti
              </Link>
            )}
            <HeaderButton href="/website/ppdb"><CalendarRange /> Atur periode</HeaderButton>
          </>
        }
      />

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
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--muted)]/70 p-1">
          <span className="w-16 shrink-0 px-2 text-xs font-semibold text-[var(--muted-foreground)]">Periode</span>
          {periods.map((period) => (
            <Link key={period.id} href={filterHref(filters, { periode: String(period.id) })} className={chip(periodId === period.id)}>
              {period.name}{period.isActive && ' · aktif'}
            </Link>
          ))}
          <Link href={filterHref(filters, { periode: 'semua' })} className={chip(!periodId)}>Semua periode</Link>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--muted)]/70 p-1">
          <span className="w-16 shrink-0 px-2 text-xs font-semibold text-[var(--muted-foreground)]">Status</span>
          <Link href={filterHref(filters, { status: undefined })} className={chip(!filters.status)}>Semua</Link>
          <Link href={filterHref(filters, { status: 'pending' })} className={chip(filters.status === 'pending')}>Perlu tindak lanjut</Link>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <Link key={value} href={filterHref(filters, { status: value })} className={chip(filters.status === value)}>{label}</Link>
          ))}
        </div>
      </div>

      {admissions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Tidak ada pendaftar" description={inPeriod.length ? 'Tidak ada pendaftar yang cocok dengan filter.' : 'Belum ada pendaftaran online untuk periode ini.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {admissions.map((item) => {
            const reference = ageReferenceDate(item.period.endDate)
            const age = ageAt(item.studentBirthDate, reference)
            const chosen = findLevel(item.preferredLevel)
            const suitable = levelForAge(age.years)
            const ageWarning = !suitable ? 'Usia di luar rentang penerimaan' : chosen && suitable.value !== chosen.value ? `Usia lebih sesuai untuk ${suitable.label}` : null
            return (
              <article key={item.id} className="app-card p-5 transition-shadow hover:shadow-[var(--shadow-raised)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={item.studentFullName} size="lg" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-[var(--muted-foreground)]">{item.applicationNo}</p>
                      <h2 className="mt-0.5 truncate font-heading text-lg font-bold">{item.studentFullName}</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">{item.period.name} · masuk {formatTanggalSingkat(item.submittedAt ?? item.createdAt)}</p>
                    </div>
                  </div>
                  <StatusPill map={ADMISSION_STATUS} status={item.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Pill tone="brand">{chosen?.label ?? item.preferredLevel ?? 'Jenjang belum dipilih'}</Pill>
                  <Pill><Cake className="size-3" /> {item.studentGender === 'L' ? 'Laki-laki' : 'Perempuan'} · {formatAge(age)} per {formatTanggalSingkat(reference)}</Pill>
                  {ageWarning && <Pill tone="warning" dot>{ageWarning}</Pill>}
                </div>

                <dl className="mt-4 grid gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3.5 text-sm sm:grid-cols-2">
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
