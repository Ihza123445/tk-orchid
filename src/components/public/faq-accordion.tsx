'use client'

import { useId, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'

type Faq = { id: number; q: string; a: string; cat: string }

// Accordion FAQ dengan animasi tinggi (grid-rows) + filter kategori & pencarian opsional.
export function FaqAccordion({ items, filterable = false }: { items: Faq[]; filterable?: boolean }) {
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(0)
  const [category, setCategory] = useState('Semua')
  const [query, setQuery] = useState('')

  const categories = useMemo(() => ['Semua', ...new Set(items.map((item) => item.cat))], [items])
  const visible = items.filter((item) => {
    const matchCategory = category === 'Semua' || item.cat === category
    const text = `${item.q} ${item.a}`.toLowerCase()
    return matchCategory && text.includes(query.trim().toLowerCase())
  })

  return (
    <div className="school-faq">
      {filterable && (
        <div className="school-faq-tools">
          <label className="school-faq-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Cari pertanyaan</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setOpen(null) }} placeholder="Cari pertanyaan…" />
          </label>
          <div className="school-chip-row" role="group" aria-label="Kategori pertanyaan">
            {categories.map((item) => (
              <button key={item} type="button" aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setOpen(null) }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="school-faq-list">
        {visible.map((item, index) => {
          const isOpen = open === index
          const panelId = `${baseId}-panel-${index}`
          return (
            <div key={item.id} className={`school-faq-item ${isOpen ? 'open' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
              <h3>
                <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : index)}>
                  <span>{item.q}</span>
                  <i aria-hidden="true"><Plus /></i>
                </button>
              </h3>
              <div id={panelId} role="region" className="school-faq-panel">
                <div><p>{item.a}</p></div>
              </div>
            </div>
          )
        })}
        {!visible.length && <p className="school-empty">Pertanyaan tidak ditemukan. Coba kata kunci lain atau hubungi kami langsung.</p>}
      </div>
    </div>
  )
}
