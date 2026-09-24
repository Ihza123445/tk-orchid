import 'server-only'
import { db } from '@/lib/db/db'
import { toInputValue } from '@/lib/cms/dates'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import type { SectionDef } from '@/lib/cms/registry'

export type FieldValue = string | boolean
export interface AdminRow {
  id: number
  values: Record<string, FieldValue>
  live: boolean
  statusLabel: string
  dateLabel: string | null
  extra: string | null
}
export type OptionMap = Record<string, { value: string; label: string }[]>

const ORDER: Record<SectionDef['model'], object> = {
  heroSlide: [{ sortOrder: 'asc' }, { id: 'asc' }],
  facility: [{ sortOrder: 'asc' }, { id: 'asc' }],
  galleryItem: [{ sortOrder: 'asc' }, { id: 'asc' }],
  testimonial: [{ sortOrder: 'asc' }, { id: 'asc' }],
  faq: [{ sortOrder: 'asc' }, { id: 'asc' }],
  activity: [{ startDatetime: 'desc' }, { id: 'desc' }],
  announcement: [{ createdAt: 'desc' }],
  admissionPeriod: [{ startDate: 'desc' }],
}

type Finder = { findMany(args: { orderBy: object }): Promise<Record<string, unknown>[]> }

export async function loadSectionRows(section: SectionDef): Promise<AdminRow[]> {
  const model = db[section.model] as unknown as Finder
  const rows = await model.findMany({ orderBy: ORDER[section.model] })

  const admissionCounts = section.model === 'admissionPeriod'
    ? Object.fromEntries((await db.admission.groupBy({ by: ['admissionPeriodId'], _count: true })).map((item) => [item.admissionPeriodId, item._count]))
    : {}

  return rows.map((row) => {
    const values: Record<string, FieldValue> = {}
    for (const field of section.fields) {
      const value = row[field.name]
      if (field.type === 'checkbox') values[field.name] = Boolean(value)
      else if (field.type === 'date' || field.type === 'datetime') values[field.name] = toInputValue(value as Date | null, field.type)
      else values[field.name] = value == null ? '' : String(value)
    }
    for (const key of Object.values(section.list)) {
      if (key && !(key in values)) values[key] = row[key] == null ? '' : String(row[key])
    }

    const status = section.status
    const raw = status ? row[status.field] : true
    const live = status ? raw === status.liveValue : true
    const statusLabel = status?.labels ? (status.labels[String(raw)] ?? String(raw)) : live ? 'Tampil' : 'Disembunyikan'
    const date = section.list.date ? (row[section.list.date] as Date | null) : null
    const dateLabel = section.model === 'admissionPeriod'
      ? `${formatTanggalSingkat(row.startDate as Date)} – ${formatTanggalSingkat(row.endDate as Date)}`
      : date ? formatTanggalSingkat(date) : null
    const extra = section.model === 'admissionPeriod' ? `${admissionCounts[row.id as number] ?? 0} pendaftar` : null

    return { id: row.id as number, values, live, statusLabel, dateLabel, extra }
  })
}

export async function loadSectionOptions(section: SectionDef): Promise<OptionMap> {
  const options: OptionMap = {}
  if (section.fields.some((field) => field.optionsFrom === 'classes')) {
    const classes = await db.class.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
    options.classes = classes.map((item) => ({ value: String(item.id), label: item.name }))
  }
  return options
}
