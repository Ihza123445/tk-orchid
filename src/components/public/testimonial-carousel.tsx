'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react'

type Testimonial = { id: number; name: string; relation: string; quote: string }

// Carousel testimoni: autoplay (pause saat hover/fokus), panah, dots, dan swipe di layar sentuh.
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  const go = useCallback((index: number) => setCurrent((index + items.length) % items.length), [items.length])

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % items.length), 6000)
    return () => window.clearInterval(timer)
  }, [paused, items.length])

  return (
    <div
      className="school-testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return
        const delta = event.changedTouches[0].clientX - touchX.current
        if (Math.abs(delta) > 45) go(current + (delta < 0 ? 1 : -1))
        touchX.current = null
      }}
      aria-roledescription="carousel"
      aria-label="Testimoni orang tua"
    >
      <div className="school-testimonial-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, index) => (
          <figure
            key={item.id}
            className={`school-testimonial-card ${index === current ? 'active' : ''}`}
            aria-hidden={index !== current}
            aria-roledescription="slide"
            aria-label={`${index + 1} dari ${items.length}`}
          >
            <Quote className="school-testimonial-quote" aria-hidden="true" />
            <div className="school-testimonial-stars" aria-label="5 dari 5 bintang">
              {Array.from({ length: 5 }, (_, star) => <Star key={star} />)}
            </div>
            <blockquote>“{item.quote}”</blockquote>
            <figcaption>
              <span aria-hidden="true">{item.name.split(' ').pop()?.[0]}</span>
              <div><strong>{item.name}</strong><small>{item.relation}</small></div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="school-testimonial-controls">
        <button type="button" onClick={() => go(current - 1)} aria-label="Testimoni sebelumnya"><ArrowLeft /></button>
        <div className="school-testimonial-dots">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Tampilkan testimoni ${index + 1}`}
              aria-current={index === current}
              className={index === current ? 'active' : ''}
              onClick={() => go(index)}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(current + 1)} aria-label="Testimoni berikutnya"><ArrowRight /></button>
      </div>
    </div>
  )
}
