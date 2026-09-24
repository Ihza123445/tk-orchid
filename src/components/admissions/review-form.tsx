'use client'

import { useActionState, useState } from 'react'
import { Check } from 'lucide-react'
import { reviewAdmissionAction, type ReviewState } from '@/actions/admissions'

export function AdmissionReviewForm({ id, status }: { id: number; status: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(reviewAdmissionAction, {})
  const [next, setNext] = useState(status === 'SUBMITTED' ? 'REVIEW' : status)

  return (
    <form action={formAction} className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select name="status" value={next} onChange={(event) => setNext(event.target.value)} aria-label="Status baru" className="field-select">
          <option value="REVIEW">Tinjau</option>
          <option value="REVISION_REQUIRED">Perlu revisi</option>
          <option value="ACCEPTED">Terima</option>
          <option value="REJECTED">Tolak</option>
        </select>
        <input
          name="reason"
          placeholder={next === 'REJECTED' ? 'Alasan penolakan (wajib)' : 'Alasan bila ditolak'}
          required={next === 'REJECTED'}
          minLength={next === 'REJECTED' ? 5 : undefined}
          maxLength={500}
          aria-label="Alasan"
          className="h-9 rounded-[10px] border border-[var(--input)] bg-[var(--card)] px-3 text-sm"
        />
        <button type="submit" disabled={pending} className="h-9 rounded-[10px] bg-[var(--primary)] px-4 text-sm font-semibold shadow-sm text-[var(--primary-foreground)] hover:brightness-110 disabled:opacity-60">
          {pending ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
      {state.error && <p role="alert" className="text-xs font-medium text-[var(--destructive)]">{state.error}</p>}
      {state.success && !pending && <p role="status" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-3.5" /> Status diperbarui.</p>}
    </form>
  )
}
