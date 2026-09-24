'use client'

import { useActionState, useState, useTransition } from 'react'
import { submitAdmissionAction, type PpdbState } from '@/actions/ppdb-public'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { LEVELS, MAX_AGE, MIN_AGE, ageAt, findLevel, formatAge, formatReferenceDate, levelForAge, parseBirthDate } from '@/lib/ppdb/levels'

const initial: PpdbState = {}

function fe(state: PpdbState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0]
}

function FieldError({ state, name }: { state: PpdbState; name: string }) {
  const message = fe(state, name)
  return message ? <p id={`pp-${name}-error`} className="text-xs font-medium text-[var(--destructive)]">{message}</p> : null
}

export function PpdbForm({ periodName, referenceDate, defaultLevel }: { periodName: string; referenceDate: string; defaultLevel?: string }) {
  const [state, formAction, pending] = useActionState(submitAdmissionAction, initial)
  const [, startTransition] = useTransition()
  const [birthDate, setBirthDate] = useState('')
  const [level, setLevel] = useState(findLevel(defaultLevel)?.value ?? '')
  const [levelTouched, setLevelTouched] = useState(Boolean(defaultLevel))

  const reference = new Date(referenceDate)
  const today = new Date().toISOString().slice(0, 10)
  const parsedBirth = parseBirthDate(birthDate)
  const age = parsedBirth ? ageAt(parsedBirth, reference) : null
  const suitable = age ? levelForAge(age.years) : undefined
  const mismatch = Boolean(age && suitable && level && suitable.value !== level)

  function onBirthDate(value: string) {
    setBirthDate(value)
    const date = parseBirthDate(value)
    const match = date ? levelForAge(ageAt(date, reference).years) : undefined
    // Pilihkan jenjang otomatis selama orang tua belum memilih sendiri
    if (match && !levelTouched) setLevel(match.value)
  }

  if (state.success && state.regNo) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto size-11 text-[var(--primary)]" />
        <h2 className="mt-5 text-xl font-bold tracking-[-.03em] text-[var(--primary)]">Pendaftaran terkirim</h2>
        <p className="mt-2 text-sm">Nomor pendaftaran anak Anda:</p>
        <p className="mt-1 font-mono text-xl font-bold">{state.regNo}</p>
        {state.levelLabel && <p className="mt-2 text-sm text-[var(--muted-foreground)]">Jenjang: <strong className="text-[var(--foreground)]">{state.levelLabel}</strong></p>}
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted-foreground)]">
          Simpan nomor ini. Tim sekolah akan menghubungi Anda melalui WhatsApp untuk proses verifikasi berikutnya.
        </p>
      </div>
    )
  }

  const input = 'h-11 w-full rounded-xl border border-[var(--input)] bg-transparent px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/25 aria-invalid:border-[var(--destructive)]'
  const invalid = (name: string) => ({ 'aria-invalid': Boolean(fe(state, name)), 'aria-describedby': fe(state, name) ? `pp-${name}-error` : undefined })

  return (
    <form
      // Kirim manual (bukan prop action) agar isian tidak hilang saat ada error validasi
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-8 rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-9"
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]">Formulir PPDB</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-.035em]">Data calon peserta didik</h2>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">Periode: <span className="font-semibold text-[var(--foreground)]">{periodName}</span></p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-[var(--secondary)] p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
        <p className="text-[var(--muted-foreground)]">
          Usia anak dihitung <strong className="text-[var(--foreground)]">per {formatReferenceDate(reference)}</strong> (awal tahun ajaran):{' '}
          {LEVELS.map((item, index) => (
            <span key={item.value}>{index > 0 && ', '}{item.label} {item.minAge}{item.maxAge - item.minAge > 1 ? `–${item.maxAge - 1}` : ''} tahun</span>
          ))}.
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-4 text-sm font-bold">01 · Data Anak</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-name">Nama Lengkap Anak *</Label>
            <Input id="pp-name" name="childFullName" required maxLength={150} autoComplete="off" {...invalid('childFullName')} />
            <FieldError state={state} name="childFullName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-gender">Jenis Kelamin *</Label>
            <select id="pp-gender" name="childGender" required defaultValue="" className={input} {...invalid('childGender')}>
              <option value="" disabled>Pilih…</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <FieldError state={state} name="childGender" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-birthplace">Tempat Lahir *</Label>
            <Input id="pp-birthplace" name="childBirthPlace" required maxLength={100} {...invalid('childBirthPlace')} />
            <FieldError state={state} name="childBirthPlace" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-birthdate">Tanggal Lahir *</Label>
            <Input id="pp-birthdate" name="childBirthDate" type="date" required max={today} value={birthDate} onChange={(event) => onBirthDate(event.target.value)} {...invalid('childBirthDate')} />
            <FieldError state={state} name="childBirthDate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-level">Jenjang yang Dituju *</Label>
            <select
              id="pp-level"
              name="preferredLevel"
              required
              value={level}
              onChange={(event) => { setLevel(event.target.value); setLevelTouched(true) }}
              className={input}
              {...invalid('preferredLevel')}
            >
              <option value="" disabled>Pilih…</option>
              {LEVELS.map((item) => (
                <option key={item.value} value={item.value}>{item.label} · {item.minAge}{item.maxAge - item.minAge > 1 ? `–${item.maxAge - 1}` : ''} tahun</option>
              ))}
            </select>
            <FieldError state={state} name="preferredLevel" />
          </div>

          {age && (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-xl p-3 text-sm sm:col-span-2 ${!suitable || mismatch ? 'bg-amber-500/10 text-amber-800 dark:text-amber-200' : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'}`}
            >
              {!suitable || mismatch ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
              <p>
                Usia anak per {formatReferenceDate(reference)}: <strong>{age.years < 0 ? 'belum lahir' : formatAge(age)}</strong>.{' '}
                {!suitable
                  ? `TK Orchid menerima anak usia ${MIN_AGE}–${MAX_AGE - 1} tahun. Silakan hubungi sekolah untuk konsultasi.`
                  : mismatch
                    ? <>Usia ini sesuai untuk <strong>{suitable.label}</strong>. <button type="button" className="font-semibold underline underline-offset-2" onClick={() => setLevel(suitable.value)}>Pilih {suitable.label}</button></>
                    : `Sesuai untuk ${suitable.label}.`}
              </p>
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-prev">Asal PAUD / Sekolah Sebelumnya</Label>
            <Input id="pp-prev" name="previousSchool" maxLength={150} placeholder="Opsional, kosongkan bila belum pernah sekolah" {...invalid('previousSchool')} />
            <FieldError state={state} name="previousSchool" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-[var(--border)] pt-7">
        <legend className="mb-4 pr-3 text-sm font-bold">02 · Orang Tua / Wali</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pp-parent">Nama Orang Tua/Wali *</Label>
            <Input id="pp-parent" name="parentName" required maxLength={150} autoComplete="name" {...invalid('parentName')} />
            <FieldError state={state} name="parentName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-rel">Hubungan *</Label>
            <select id="pp-rel" name="relationship" required defaultValue="" className={input} {...invalid('relationship')}>
              <option value="" disabled>Pilih…</option>
              <option value="AYAH">Ayah</option>
              <option value="IBU">Ibu</option>
              <option value="WALI">Wali</option>
            </select>
            <FieldError state={state} name="relationship" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-phone">No. HP / WhatsApp *</Label>
            <Input id="pp-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="08xxxxxxxxxx" {...invalid('phone')} />
            <FieldError state={state} name="phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-email">Email</Label>
            <Input id="pp-email" name="email" type="email" autoComplete="email" {...invalid('email')} />
            <FieldError state={state} name="email" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-address">Alamat *</Label>
            <textarea id="pp-address" name="address" required maxLength={500} rows={3} autoComplete="street-address" {...invalid('address')} className="w-full rounded-xl border border-[var(--input)] bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/25 aria-invalid:border-[var(--destructive)]" />
            <FieldError state={state} name="address" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-notes">Catatan</Label>
            <Input id="pp-notes" name="notes" maxLength={500} placeholder="Opsional, misalnya kebutuhan khusus atau alergi" {...invalid('notes')} />
            <FieldError state={state} name="notes" />
          </div>
        </div>
      </fieldset>

      {state.error && <p role="alert" className="rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{state.error}</p>}

      <Button type="submit" disabled={pending} className="min-h-12 w-full rounded-full px-7 sm:w-auto">
        {pending ? 'Mengirim…' : <>Kirim pendaftaran <ArrowRight className="size-4" /></>}
      </Button>
    </form>
  )
}
