'use client'

import { useActionState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { saveSettingsAction, type ContentFormState } from '@/actions/website'
import { SETTING_GROUPS } from '@/lib/cms/registry'
import type { SiteSettings } from '@/lib/cms/defaults'
import { FieldInput } from '@/components/website/field-input'

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(saveSettingsAction, {})
  const [, startTransition] = useTransition()

  return (
    <form
      // Kirim manual agar isian tidak di-reset saat ada error validasi
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-6"
    >
      {SETTING_GROUPS.map((group) => (
        <section key={group.title} className="form-card">
          <h2>{group.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{group.description}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <FieldInput key={field.name} field={field} value={settings[field.name as keyof SiteSettings]} error={state.fields?.[field.name]} />
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-4 shadow-[var(--shadow-raised)] backdrop-blur">
        {state.error && <p className="mr-auto text-sm font-medium text-[var(--destructive)]">{state.error}</p>}
        {state.success && !pending && <p className="mr-auto flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-4" /> Pengaturan tersimpan dan sudah tampil di website.</p>}
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60">
          {pending ? 'Menyimpan…' : <><Check className="size-4" /> Simpan pengaturan</>}
        </button>
      </div>
    </form>
  )
}
