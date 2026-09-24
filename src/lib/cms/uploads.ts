import 'server-only'
import crypto from 'node:crypto'
import path from 'node:path'
import { mkdir, unlink, writeFile } from 'node:fs/promises'

// Foto yang diunggah admin disimpan di luar /public (file di /public hanya disajikan
// jika sudah ada saat build) lalu disajikan lewat route /media/[...path].
export const UPLOAD_ROOT = path.join(process.cwd(), 'storage', 'uploads')
export const MEDIA_PREFIX = '/media/'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export const MEDIA_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export class UploadError extends Error {}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof value === 'object' && value !== null && 'arrayBuffer' in value && value.size > 0
}

/** Simpan gambar dari form. Mengembalikan URL publik (/media/...) atau null bila tidak ada file. */
export async function saveImage(value: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!isUploadedFile(value)) return null
  const ext = EXTENSIONS[value.type]
  if (!ext) throw new UploadError('Format foto harus JPG, PNG, WEBP, atau GIF.')
  if (value.size > MAX_IMAGE_BYTES) throw new UploadError('Ukuran foto maksimal 5 MB.')

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '')
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const dir = path.join(UPLOAD_ROOT, safeFolder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), Buffer.from(await value.arrayBuffer()))
  return `${MEDIA_PREFIX}${safeFolder}/${name}`
}

/** Hapus file unggahan lama. URL eksternal (mis. Unsplash) diabaikan. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url?.startsWith(MEDIA_PREFIX)) return
  const target = path.resolve(UPLOAD_ROOT, url.slice(MEDIA_PREFIX.length))
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return
  await unlink(target).catch(() => undefined)
}
