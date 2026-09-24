'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Flower2, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import { CountUp } from '@/components/public/reveal'

export type HeroSlideData = {
  id: number
  eyebrow: string
  title: string
  accent: string | null
  description: string
  image: string
  imageAlt: string | null
}

// Hero beranda: foto selebar layar yang berganti dengan crossfade, teks di atas lapisan gelap.
export function HeroSlider({ slides, stats }: { slides: HeroSlideData[]; stats: { students: number; teachers: number; activities: number } }) {
  const [current, setCurrent] = useState(0)
  const count = slides.length

  // Ganti slide tiap 7 detik; timer diulang setiap kali slide berganti (termasuk saat diklik manual)
  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => setCurrent((value) => (value + 1) % count), 7000)
    return () => window.clearTimeout(timer)
  }, [current, count])

  const go = (value: number) => setCurrent((value + count) % count)
  const slide = slides[Math.min(current, count - 1)]
  if (!slide) return null

  return (
    <>
      <section className="school-home-hero" aria-roledescription="carousel" aria-label="Sorotan TK Orchid">
        <div className="school-home-slides" aria-hidden="true">
          {slides.map((item, index) => (
            <div key={item.id} className={`school-home-slide ${index === current ? 'active' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" fetchPriority={index === 0 ? 'high' : 'low'} loading={index === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
        <div className="school-home-shade" aria-hidden="true" />

        <div className="public-container school-home-inner">
          <div className="school-home-copy" key={slide.id} aria-live="polite">
            <span className="school-home-eyebrow"><Sparkles className="size-4" /> {slide.eyebrow}</span>
            <h1>{slide.title}{slide.accent ? <> <span>{slide.accent}</span></> : null}</h1>
            <p>{slide.description}</p>
            {slide.imageAlt && <span className="sr-only">Foto: {slide.imageAlt}</span>}
            <div className="school-home-actions">
              <Link href="/pendaftaran#formulir">Daftar PPDB <ArrowUpRight className="size-4" /></Link>
              <Link href="/program" className="secondary">Lihat program <BookOpen className="size-4" /></Link>
            </div>
          </div>

          {count > 1 && (
            <div className="school-home-nav">
              <div className="school-home-dots" role="tablist" aria-label="Pilih sorotan">
                {slides.map((item, index) => (
                  <button key={item.id} type="button" role="tab" aria-selected={current === index} aria-label={`Tampilkan sorotan ${index + 1}`} onClick={() => setCurrent(index)}>
                    <span className={current === index ? 'active' : ''} />
                  </button>
                ))}
              </div>
              <span className="school-home-count">{String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
              <div className="school-home-arrows">
                <button type="button" onClick={() => go(current - 1)} aria-label="Sorotan sebelumnya"><ArrowLeft /></button>
                <button type="button" onClick={() => go(current + 1)} aria-label="Sorotan berikutnya"><ArrowRight /></button>
              </div>
            </div>
          )}
        </div>

        <svg className="school-banner-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60V32c160 22 360 30 560 14S980 2 1180 8c110 3 190 12 260 22v30z" />
        </svg>
      </section>

      <div className="public-container school-home-stats-wrap">
        <div className="school-stats" aria-label="Ringkasan sekolah">
          <div><span className="school-stat-icon"><Flower2 /></span><p><strong><CountUp value={stats.students} suffix="+" /></strong><small>Siswa aktif</small></p></div>
          <div><span className="school-stat-icon gold"><Heart /></span><p><strong><CountUp value={stats.teachers} suffix="+" /></strong><small>Guru &amp; staf</small></p></div>
          <div><span className="school-stat-icon"><Sparkles /></span><p><strong><CountUp value={stats.activities} suffix="+" /></strong><small>Cerita kegiatan</small></p></div>
          <div><span className="school-stat-icon gold"><ShieldCheck /></span><p><strong>Aman</strong><small>Lingkungan belajar</small></p></div>
        </div>
      </div>
    </>
  )
}
