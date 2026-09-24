'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'node:crypto'
import { db } from '@/lib/db/db'
import { requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'
import { CONTENT_SECTIONS, SETTING_GROUPS, type FieldDef, type SectionDef } from '@/lib/cms/registry'
import { fromInputValue } from '@/lib/cms/dates'
import { UploadError, deleteImage, saveImage } from '@/lib/cms/uploads'
import { DEFAULT_SETTINGS } from '@/lib/cms/defaults'

export interface ContentFormState {
  error?: string
  fields?: Record<string, string>
  success?: boolean
  savedAt?: number
}

export interface ContentActionResult {
  error?: string
}

type Row = Record<string, unknown> & { id: number }
type Data = Record<string, unknown>

// Subset API Prisma yang sama untuk semua model konten.
interface Delegate {
  findUnique(args: { where: { id: number } }): Promise<Row | null>
  findFirst(args: { where?: Data; orderBy?: Data; select?: Data }): Promise<Row | null>
  findMany(args: { where?: Data; orderBy?: Data[]; select?: Data }): Promise<Row[]>
  create(args: { data: Data }): Promise<Row>
  update(args: { where: { id: number }; data: Data }): Promise<Row>
  updateMany(args: { where: Data; data: Data }): Promise<unknown>
  delete(args: { where: { id: number } }): Promise<Row>
}

function delegateFor(section: SectionDef): Delegate {
  return db[section.model] as unknown as Delegate
}

const IMAGE_URL = /^(https:\/\/|\/media\/)/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validasi & konversi semua field non-gambar dari FormData sesuai definisi registry. */
function parseFields(fields: FieldDef[], formData: FormData) {
  const data: Data = {}
  const errors: Record<string, string> = {}

  for (const field of fields) {
    if (field.type === 'image') continue
    if (field.showIf && String(formData.get(field.showIf.field) ?? '') !== field.showIf.equals) {
      data[field.name] = null
      continue
    }
    if (field.type === 'checkbox') {
      data[field.name] = formData.get(field.name) === 'on'
      continue
    }

    const raw = String(formData.get(field.name) ?? '').trim()
    if (field.required && !raw) {
      errors[field.name] = `${field.label} wajib diisi.`
      continue
    }
    if (field.max && raw.length > field.max) {
      errors[field.name] = `Maksimal ${field.max} karakter.`
      continue
    }

    if (field.type === 'date' || field.type === 'datetime') {
      const date = fromInputValue(raw, field.type, field.endOfDay)
      if (date === undefined) errors[field.name] = 'Tanggal tidak valid.'
      else data[field.name] = date
      continue
    }
    if (field.type === 'select' && raw) {
      if (field.options && !field.options.some((option) => option.value === raw)) {
        errors[field.name] = 'Pilihan tidak valid.'
        continue
      }
      if (field.int) {
        const value = Number(raw)
        if (!Number.isInteger(value)) errors[field.name] = 'Pilihan tidak valid.'
        else data[field.name] = value
        continue
      }
    }
    data[field.name] = raw || null
  }

  return { data, errors }
}

/** Simpan foto baru (bila diunggah) atau pakai URL yang diisi. */
async function resolveImages(fields: FieldDef[], formData: FormData, folder: string, errors: Record<string, string>) {
  const images: Data = {}
  for (const field of fields.filter((item) => item.type === 'image')) {
    const url = String(formData.get(`${field.name}__url`) ?? '').trim()
    if (url && !IMAGE_URL.test(url)) {
      errors[field.name] = 'URL foto harus diawali https://'
      continue
    }
    const uploaded = await saveImage(formData.get(field.name), folder)
    const value = uploaded ?? (url || null)
    if (field.required && !value) errors[field.name] = `${field.label} wajib diisi.`
    images[field.name] = value
  }
  return images
}

function checkDateOrder(data: Data, errors: Record<string, string>, start: string, end: string) {
  const from = data[start]
  const to = data[end]
  if (from instanceof Date && to instanceof Date && to <= from) errors[end] = 'Harus setelah tanggal mulai.'
}

async function uniqueSlug(model: Delegate, title: string, ignoreId: number | null) {
  const base = title.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 70) || 'konten'
  let slug = base
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await model.findFirst({ where: { slug }, select: { id: true } })
    if (!clash || clash.id === ignoreId) return slug
    slug = `${base}-${crypto.randomBytes(2).toString('hex')}`
  }
  return `${base}-${Date.now()}`
}

function fieldErrorsMessage(errors: Record<string, string>) {
  return Object.keys(errors).length ? 'Periksa kembali isian yang ditandai.' : undefined
}

function revalidateSite() {
  // Semua halaman publik, portal, guru, dan admin memakai konten ini.
  revalidatePath('/', 'layout')
}

export async function saveContentAction(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const user = await requireAdminStaff()
  const section = CONTENT_SECTIONS[String(formData.get('section'))]
  if (!section) return { error: 'Jenis konten tidak dikenal.' }
  const model = delegateFor(section)

  const id = formData.get('id') ? Number(formData.get('id')) : null
  const existing = id ? await model.findUnique({ where: { id } }) : null
  if (id && !existing) return { error: 'Data tidak ditemukan. Muat ulang halaman.' }

  const { data, errors } = parseFields(section.fields, formData)
  checkDateOrder(data, errors, 'startDatetime', 'endDatetime')
  checkDateOrder(data, errors, 'startDate', 'endDate')
  checkDateOrder(data, errors, 'publishAt', 'expireAt')
  if (fieldErrorsMessage(errors)) return { error: fieldErrorsMessage(errors), fields: errors }

  try {
    Object.assign(data, await resolveImages(section.fields, formData, section.key, errors))
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message }
    console.error('[website] upload gagal:', err)
    return { error: 'Gagal mengunggah foto.' }
  }
  if (fieldErrorsMessage(errors)) return { error: fieldErrorsMessage(errors), fields: errors }

  // Aturan khusus per jenis konten
  if (section.model === 'activity' || section.model === 'announcement') {
    if (!existing || existing.title !== data.title) data.slug = await uniqueSlug(model, String(data.title), id)
    if (!existing) data.createdBy = user.id
  }
  if (section.model === 'announcement' && !data.publishAt && data.status === 'PUBLISHED') {
    data.publishAt = existing?.publishAt ?? new Date()
  }
  if (section.sortable && !existing) {
    const last = await model.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
    data.sortOrder = Number(last?.sortOrder ?? -1) + 1
  }

  try {
    const saved = existing ? await model.update({ where: { id: existing.id }, data }) : await model.create({ data })
    if (section.model === 'admissionPeriod' && saved.isActive) {
      await db.admissionPeriod.updateMany({ where: { id: { not: saved.id } }, data: { isActive: false } })
    }
    for (const field of section.fields.filter((item) => item.type === 'image')) {
      const old = existing?.[field.name]
      if (typeof old === 'string' && old !== saved[field.name]) await deleteImage(old)
    }
    await audit({
      userId: user.id,
      action: existing ? 'WEBSITE_UPDATE' : 'WEBSITE_CREATE',
      entityType: section.model,
      entityId: saved.id,
      afterJson: JSON.stringify({ title: saved.title ?? saved.name ?? saved.question ?? null }),
    })
  } catch (err) {
    console.error('[website] simpan gagal:', err)
    return { error: 'Gagal menyimpan. Coba lagi.' }
  }

  revalidateSite()
  return { success: true, savedAt: Date.now() }
}

async function loadForAction(sectionKey: string, id: number) {
  const user = await requireAdminStaff()
  const section = CONTENT_SECTIONS[sectionKey]
  if (!section || !Number.isInteger(id)) return null
  const model = delegateFor(section)
  const row = await model.findUnique({ where: { id } })
  return row ? { user, section, model, row } : null
}

export async function deleteContentAction(sectionKey: string, id: number): Promise<ContentActionResult> {
  const loaded = await loadForAction(sectionKey, id)
  if (!loaded) return { error: 'Data tidak ditemukan.' }
  const { user, section, model, row } = loaded

  if (section.model === 'admissionPeriod') {
    const count = await db.admission.count({ where: { admissionPeriodId: id } })
    if (count > 0) return { error: `Periode ini sudah memiliki ${count} pendaftar sehingga tidak bisa dihapus. Nonaktifkan saja.` }
  }

  try {
    await model.delete({ where: { id } })
  } catch (err) {
    console.error('[website] hapus gagal:', err)
    return { error: 'Gagal menghapus data.' }
  }
  for (const field of section.fields.filter((item) => item.type === 'image')) await deleteImage(row[field.name] as string | null)
  await audit({ userId: user.id, action: 'WEBSITE_DELETE', entityType: section.model, entityId: id })
  revalidateSite()
  return {}
}

export async function toggleContentAction(sectionKey: string, id: number): Promise<ContentActionResult> {
  const loaded = await loadForAction(sectionKey, id)
  if (!loaded?.section.status) return { error: 'Data tidak ditemukan.' }
  const { user, section, model, row } = loaded
  const { field } = section.status!

  const next = field === 'isActive' ? !row.isActive : row.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  const data: Data = { [field]: next }
  if (section.model === 'announcement' && next === 'PUBLISHED' && !row.publishAt) data.publishAt = new Date()

  await model.update({ where: { id }, data })
  if (section.model === 'admissionPeriod' && next === true) {
    await db.admissionPeriod.updateMany({ where: { id: { not: id } }, data: { isActive: false } })
  }
  await audit({ userId: user.id, action: 'WEBSITE_TOGGLE', entityType: section.model, entityId: id, afterJson: JSON.stringify(data) })
  revalidateSite()
  return {}
}

export async function moveContentAction(sectionKey: string, id: number, direction: 'up' | 'down'): Promise<ContentActionResult> {
  const loaded = await loadForAction(sectionKey, id)
  if (!loaded?.section.sortable) return { error: 'Data tidak ditemukan.' }
  const { model } = loaded

  const rows = await model.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true } })
  const index = rows.findIndex((item) => item.id === id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= rows.length) return {}
  ;[rows[index], rows[target]] = [rows[target], rows[index]]

  await db.$transaction(rows.map((item, order) => (model.update({ where: { id: item.id }, data: { sortOrder: order } }) as never)))
  revalidateSite()
  return {}
}

// ===== Pengaturan situs =====

export async function saveSettingsAction(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const user = await requireAdminStaff()
  const fields = SETTING_GROUPS.flatMap((group) => group.fields)
  const { data, errors } = parseFields(fields, formData)

  const whatsapp = String(data.whatsapp ?? '').replace(/\D/g, '')
  if (data.whatsapp && !/^62\d{8,13}$/.test(whatsapp)) errors.whatsapp = 'Gunakan format 62xxxxxxxxxx (tanpa 0 di depan).'
  else data.whatsapp = whatsapp
  if (data.email && !EMAIL.test(String(data.email))) errors.email = 'Email tidak valid.'
  for (const key of ['instagram', 'facebook', 'youtube']) {
    if (data[key] && !/^https:\/\//.test(String(data[key]))) errors[key] = 'Link harus diawali https://'
  }
  if (fieldErrorsMessage(errors)) return { error: fieldErrorsMessage(errors), fields: errors }

  const previous = await db.siteSetting.findUnique({ where: { key: 'principalImage' } })
  try {
    Object.assign(data, await resolveImages(fields, formData, 'pengaturan', errors))
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message }
    console.error('[website] upload gagal:', err)
    return { error: 'Gagal mengunggah foto.' }
  }
  if (fieldErrorsMessage(errors)) return { error: fieldErrorsMessage(errors), fields: errors }

  const entries = Object.entries(data).filter(([key]) => key in DEFAULT_SETTINGS)
  await db.$transaction(
    entries.map(([key, value]) =>
      db.siteSetting.upsert({ where: { key }, create: { key, value: String(value ?? '') }, update: { value: String(value ?? '') } }),
    ),
  )
  if (previous && previous.value !== data.principalImage) await deleteImage(previous.value)
  await audit({ userId: user.id, action: 'WEBSITE_SETTINGS_UPDATE', entityType: 'SiteSetting', afterJson: JSON.stringify(Object.keys(data)) })

  revalidateSite()
  return { success: true, savedAt: Date.now() }
}
