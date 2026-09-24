'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Link2, X } from 'lucide-react'
import type { FieldDef } from '@/lib/cms/registry'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const inputClass =
  'w-full rounded-xl border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--ring)]/20 aria-invalid:border-[var(--destructive)]'

/** Satu input form berdasarkan definisi field registry. */
export function FieldInput({
  field,
  value,
  error,
  options,
  onValueChange,
}: {
  field: FieldDef
  value: string | boolean | undefined
  error?: string
  options?: { value: string; label: string }[]
  onValueChange?: (name: string, value: string) => void
}) {
  const id = `field-${field.name}`
  const describedBy = [field.help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const common = { id, name: field.name, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy }

  if (field.type === 'checkbox') {
    return (
      <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] px-4 ${field.wide ? 'sm:col-span-2' : ''}`}>
        <input type="checkbox" {...common} defaultChecked={Boolean(value)} className="size-4 accent-[var(--primary)]" />
        <span className="text-sm font-medium">{field.label}</span>
      </label>
    )
  }

  return (
    <div className={`space-y-1.5 ${field.wide || field.type === 'image' ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-[var(--destructive)]">*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea {...common} defaultValue={String(value ?? '')} maxLength={field.max} placeholder={field.placeholder} rows={field.max && field.max > 600 ? 7 : 4} className={inputClass} />
      ) : field.type === 'select' ? (
        <select
          {...common}
          defaultValue={String(value ?? '')}
          onChange={(event) => onValueChange?.(field.name, event.target.value)}
          className={inputClass}
        >
          {!field.required || !value ? <option value="">— Pilih —</option> : null}
          {(field.options ?? options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : field.type === 'image' ? (
        <ImageInput field={field} value={String(value ?? '')} invalid={Boolean(error)} />
      ) : (
        <input
          {...common}
          type={field.type === 'datetime' ? 'datetime-local' : field.type === 'date' ? 'date' : 'text'}
          defaultValue={String(value ?? '')}
          maxLength={field.max}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}

      {field.help && <p id={`${id}-help`} className="text-xs text-[var(--muted-foreground)]">{field.help}</p>}
      {error && <p id={`${id}-error`} className="text-xs font-medium text-[var(--destructive)]">{error}</p>}
    </div>
  )
}

function ImageInput({ field, value, invalid }: { field: FieldDef; value: string; invalid: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(value)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [showUrl, setShowUrl] = useState(false)
  const shown = preview ?? url

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFileError(null)
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError('Ukuran foto maksimal 5 MB. Kecilkan dulu fotonya.')
      event.target.value = ''
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  function clear() {
    if (fileRef.current) fileRef.current.value = ''
    setPreview(null)
    setUrl('')
  }

  return (
    <div className={`overflow-hidden rounded-2xl border ${invalid ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}>
      <div className="relative grid min-h-44 place-items-center bg-[var(--muted)]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Pratinjau" className="h-52 w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-[var(--muted-foreground)]">
            <ImagePlus className="size-8" />
            Belum ada foto
          </div>
        )}
        {shown && !field.required && (
          <button type="button" onClick={clear} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Hapus foto">
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] p-3">
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90">
          <ImagePlus className="size-4" /> {shown ? 'Ganti foto' : 'Unggah foto'}
          <input ref={fileRef} type="file" name={field.name} accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} className="sr-only" />
        </label>
        <button type="button" onClick={() => setShowUrl((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--muted)]">
          <Link2 className="size-4" /> Pakai link
        </button>
        <span className="text-xs text-[var(--muted-foreground)]">JPG, PNG, WEBP, GIF · maks. 5 MB</span>
      </div>
      <div className={showUrl ? 'border-t border-[var(--border)] p-3' : 'hidden'}>
        <input
          name={`${field.name}__url`}
          value={url}
          onChange={(event) => { setUrl(event.target.value); setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
          placeholder="https://…"
          className={inputClass}
          aria-label={`Link ${field.label}`}
        />
      </div>
      {fileError && <p className="border-t border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--destructive)]">{fileError}</p>}
    </div>
  )
}
