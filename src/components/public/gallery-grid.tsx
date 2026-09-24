'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, X, ZoomIn } from 'lucide-react'

type GalleryItem = { image: string; title: string; category: string }

// Galeri masonry dengan filter kategori dan lightbox (Esc / panah kiri-kanan).
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState('Semua')
  const [active, setActive] = useState<number | null>(null)

  const categories = useMemo(() => ['Semua', ...new Set(items.map((item) => item.category))], [items])
  const visible = category === 'Semua' ? items : items.filter((item) => item.category === category)

  const step = useCallback(
    (delta: number) => setActive((value) => (value === null ? value : (value + delta + visible.length) % visible.length)),
    [visible.length],
  )

  useEffect(() => {
    if (active === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [active, step])

  const current = active === null ? null : visible[active]

  return (
    <>
      <div className="school-chip-row centered" role="group" aria-label="Filter galeri">
        {categories.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
            {item}
            <small>{item === 'Semua' ? items.length : items.filter((entry) => entry.category === item).length}</small>
          </button>
        ))}
      </div>

      <div className="school-masonry" key={category}>
        {visible.map((item, index) => (
          <button
            key={`${item.title}-${index}`}
            type="button"
            className="school-masonry-item"
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={() => setActive(index)}
            aria-label={`Perbesar foto: ${item.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} loading="lazy" />
            <span className="school-masonry-caption">
              <small>{item.category}</small>
              <strong>{item.title}</strong>
            </span>
            <span className="school-masonry-zoom" aria-hidden="true"><ZoomIn /></span>
          </button>
        ))}
      </div>

      {current && (
        <div className="school-lightbox" role="dialog" aria-modal="true" aria-label={current.title} onClick={() => setActive(null)}>
          <button type="button" className="school-lightbox-close" onClick={() => setActive(null)} aria-label="Tutup"><X /></button>
          <button type="button" className="school-lightbox-nav prev" onClick={(event) => { event.stopPropagation(); step(-1) }} aria-label="Foto sebelumnya"><ArrowLeft /></button>
          <figure key={current.image + active} onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.image.replace(/w=\d+/, 'w=1600')} alt={current.title} />
            <figcaption><strong>{current.title}</strong><span>{current.category} · {active! + 1} / {visible.length}</span></figcaption>
          </figure>
          <button type="button" className="school-lightbox-nav next" onClick={(event) => { event.stopPropagation(); step(1) }} aria-label="Foto berikutnya"><ArrowRight /></button>
        </div>
      )}
    </>
  )
}
