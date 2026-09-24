'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// Scroll-reveal ringan tanpa dependency: IntersectionObserver + CSS transition
export function Reveal({
  children,
  delay = 0,
  className = '',
  variant = 'up',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  variant?: 'up' | 'left' | 'right' | 'scale'
  as?: 'div' | 'section' | 'li' | 'article' | 'span'
}) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('reveal-visible')
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('reveal-visible')
            obs.disconnect()
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal reveal-${variant} ${className}`}
    >
      {children}
    </Tag>
  )
}

// Angka counter yang jalan saat masuk viewport (untuk statistik)
export function CountUp({ value, suffix = '', duration = 1600 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const runDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? Math.min(duration, 600)
      : duration
    let raf = 0
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        obs.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / runDuration)
          const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
          setDisplay(Math.round(eased * value))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}
