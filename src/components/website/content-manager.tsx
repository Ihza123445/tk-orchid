'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, CalendarDays, CalendarRange, Check, ExternalLink, Eye, EyeOff, GalleryHorizontalEnd, ImageOff, Images, Megaphone, MessageSquareQuote, MessagesSquare, Pencil, Plus, School, Sparkles, Trash2, X, type LucideIcon } from 'lucide-react'
import { EmptyState, HeaderButton, PageHeader, Pill } from '@/components/dashboard/primitives'
import { deleteContentAction, moveContentAction, saveContentAction, toggleContentAction, type ContentFormState } from '@/actions/website'
import { BADGE_LABELS, type SectionDef } from '@/lib/cms/registry'
import type { AdminRow, OptionMap } from '@/lib/cms/admin-data'
import { FieldInput } from '@/components/website/field-input'

const SECTION_ICONS: Record<string, LucideIcon> = {
  slider: GalleryHorizontalEnd,
  kegiatan: Sparkles,
  pengumuman: Megaphone,
  galeri: Images,
  fasilitas: School,
  testimoni: MessageSquareQuote,
  faq: MessagesSquare,
  ppdb: CalendarRange,
}

type Editing = { mode: 'new' } | { mode: 'edit'; row: AdminRow } | null

export function ContentManager({ section, rows, options }: { section: SectionDef; rows: AdminRow[]; options: OptionMap }) {
  const [editing, setEditing] = useState<Editing>(null)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (notice?.tone !== 'ok') return
    const timer = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  function run(action: () => Promise<{ error?: string }>, okText: string) {
    startTransition(async () => {
      const result = await action()
      setNotice(result.error ? { tone: 'error', text: result.error } : { tone: 'ok', text: okText })
      setConfirmId(null)
    })
  }

  const { list } = section
  const liveCount = rows.filter((row) => row.live).length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SECTION_ICONS[section.key] ?? Sparkles}
        back={{ href: '/website', label: 'Kelola website' }}
        title={section.title}
        description={section.description}
        actions={
          <>
            <HeaderButton href={section.publicHref} external><ExternalLink /> Lihat di website</HeaderButton>
            <button type="button" onClick={() => setEditing({ mode: 'new' })} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm shadow-[var(--primary)]/25 transition-all hover:-translate-y-px hover:shadow-md">
              <Plus className="size-4" /> Tambah {section.singular}
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Pill>{rows.length} total</Pill>
        <Pill tone="success" dot>{liveCount} tampil</Pill>
        {section.sortable && <span className="text-xs text-[var(--muted-foreground)]">Gunakan panah untuk mengatur urutan tampil</span>}
      </div>

      {notice && (
        <div role="status" className={`flex items-start justify-between gap-3 rounded-xl border p-3 text-sm ${notice.tone === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-[var(--destructive)]/40 bg-[var(--destructive)]/10 text-[var(--destructive)]'}`}>
          <span className="flex items-center gap-2">{notice.tone === 'ok' && <Check className="size-4" />}{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Tutup pesan"><X className="size-4" /></button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={SECTION_ICONS[section.key] ?? Sparkles}
          title={`Belum ada ${section.singular}`}
          description={section.emptyText}
          action={
            <button type="button" onClick={() => setEditing({ mode: 'new' })} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm">
              <Plus className="size-4" /> Tambah {section.singular} pertama
            </button>
          }
        />
      ) : (
        <ul className={`grid gap-4 ${list.image ? 'sm:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'}`} aria-busy={pending}>
          {rows.map((row, index) => {
            const image = list.image ? String(row.values[list.image] ?? '') : ''
            const badge = list.badge ? String(row.values[list.badge] ?? '') : ''
            return (
              <li key={row.id} className={`app-card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] ${row.live ? '' : 'opacity-70'}`}>
                {list.image && (
                  <div className="relative aspect-[16/9] bg-[var(--muted)]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid size-full place-items-center text-[var(--muted-foreground)]"><ImageOff className="size-6" /></div>
                    )}
                    {section.sortable && <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">#{index + 1}</span>}
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Pill tone={row.live ? 'success' : 'neutral'} dot>{row.statusLabel}</Pill>
                    {badge && <Pill tone="brand">{BADGE_LABELS[badge] ?? badge}</Pill>}
                    {!list.image && section.sortable && <span className="text-[var(--muted-foreground)]">#{index + 1}</span>}
                  </div>
                  <h2 className="font-semibold leading-snug">{String(row.values[list.title] ?? '')}</h2>
                  {list.subtitle && row.values[list.subtitle] && <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">{String(row.values[list.subtitle])}</p>}
                  {(row.dateLabel || row.extra) && (
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
                      {row.dateLabel && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {row.dateLabel}</span>}
                      {row.extra && <span>{row.extra}</span>}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-[var(--border)] pt-3">
                    <IconButton label="Edit" onClick={() => setEditing({ mode: 'edit', row })}><Pencil /></IconButton>
                    {section.status && (
                      <IconButton label={row.live ? 'Sembunyikan' : 'Tampilkan'} disabled={pending} onClick={() => run(() => toggleContentAction(section.key, row.id), row.live ? 'Disembunyikan dari website.' : 'Sekarang tampil di website.')}>
                        {row.live ? <EyeOff /> : <Eye />}
                      </IconButton>
                    )}
                    {section.sortable && (
                      <>
                        <IconButton label="Naikkan" disabled={pending || index === 0} onClick={() => run(() => moveContentAction(section.key, row.id, 'up'), 'Urutan diperbarui.')}><ArrowUp /></IconButton>
                        <IconButton label="Turunkan" disabled={pending || index === rows.length - 1} onClick={() => run(() => moveContentAction(section.key, row.id, 'down'), 'Urutan diperbarui.')}><ArrowDown /></IconButton>
                      </>
                    )}
                    <span className="ml-auto" />
                    {confirmId === row.id ? (
                      <span className="flex items-center gap-1 text-xs">
                        Hapus?
                        <button type="button" disabled={pending} onClick={() => run(() => deleteContentAction(section.key, row.id), 'Data dihapus.')} className="rounded-lg bg-[var(--destructive)] px-2.5 py-1.5 font-semibold text-white">Ya, hapus</button>
                        <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5">Batal</button>
                      </span>
                    ) : (
                      <IconButton label="Hapus" danger onClick={() => setConfirmId(row.id)}><Trash2 /></IconButton>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <EditorDialog
          key={editing.mode === 'edit' ? editing.row.id : 'new'}
          section={section}
          row={editing.mode === 'edit' ? editing.row : null}
          options={options}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setNotice({ tone: 'ok', text: 'Perubahan tersimpan dan sudah tampil di website.' }) }}
        />
      )}
    </div>
  )
}

function IconButton({ label, children, onClick, disabled, danger }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg transition-colors disabled:opacity-40 [&_svg]:size-4 ${danger ? 'text-[var(--destructive)] hover:bg-[var(--destructive)]/10' : 'hover:bg-[var(--muted)]'}`}
    >
      {children}
    </button>
  )
}

function EditorDialog({
  section,
  row,
  options,
  onClose,
  onSaved,
}: {
  section: SectionDef
  row: AdminRow | null
  options: OptionMap
  onClose: () => void
  onSaved: () => void
}) {
  const initialValues = Object.fromEntries(
    section.fields.map((field) => [field.name, row ? row.values[field.name] : (field.defaultValue ?? (field.type === 'checkbox' ? false : ''))]),
  )
  const [watched, setWatched] = useState<Record<string, string>>(
    Object.fromEntries(section.fields.filter((field) => field.type === 'select').map((field) => [field.name, String(initialValues[field.name] ?? '')])),
  )
  const [state, formAction, pending] = useActionState(async (prev: ContentFormState, formData: FormData) => {
    const result = await saveContentAction(prev, formData)
    if (result.success) onSaved()
    return result
  }, {})
  const [, startTransition] = useTransition()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !pending) onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, pending])

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <form
        // Kirim manual (bukan prop action) agar isian tidak di-reset React saat ada error validasi
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          startTransition(() => formAction(formData))
        }}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--card)] shadow-2xl sm:rounded-3xl">
        <input type="hidden" name="section" value={section.key} />
        {row && <input type="hidden" name="id" value={row.id} />}

        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 id="editor-title" className="text-lg font-semibold">{row ? `Edit ${section.singular}` : `Tambah ${section.singular}`}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-[var(--muted)]" aria-label="Tutup"><X className="size-4" /></button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          {section.fields.map((field) => {
            if (field.showIf && watched[field.showIf.field] !== field.showIf.equals) return null
            return (
              <FieldInput
                key={field.name}
                field={field}
                value={initialValues[field.name]}
                error={state.fields?.[field.name]}
                options={field.optionsFrom ? options[field.optionsFrom] : undefined}
                onValueChange={(name, value) => setWatched((current) => ({ ...current, [name]: value }))}
              />
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] px-6 py-4">
          {state.error && <p className="mr-auto text-sm font-medium text-[var(--destructive)]">{state.error}</p>}
          <button type="button" onClick={onClose} disabled={pending} className="h-10 rounded-xl border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--muted)]">Batal</button>
          <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60">
            {pending ? 'Menyimpan…' : <><Check className="size-4" /> Simpan</>}
          </button>
        </div>
      </form>
    </div>
  )
}
