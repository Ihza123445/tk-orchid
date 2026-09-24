'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CountUp } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export interface HeroSlide {
  title: string
  subtitle: string
  description: string
}

const SLIDES: HeroSlide[] = [
  {
    title: 'TK Orchid',
    subtitle: 'Rumah Belajar Pertama untuk Anak Hebat',
    description:
      'Membangun fondasi karakter, kreativitas, dan kepercayaan diri anak melalui bermain, tumbuh, dan mengenal Tuhan.',
  },
  {
    title: 'Bermain Sambil Belajar',
    subtitle: 'Kurikulum Merdeka untuk Masa Depan Ceria',
    description:
      'Pembelajaran tematik yang menyenangkan: seni, musik, motorik, literasi, dan numerasi dalam suasana penuh kasih.',
  },
  {
    title: 'PPDB Telah Dibuka',
    subtitle: 'Tahun Ajaran 2026/2027',
    description:
      'Daftarkan putra-putri Anda dan jadilah bagian dari keluarga besar TK Orchid Bekasi.',
  },
]

const SLIDE_IMAGES = [IMG.hero1, IMG.hero2, IMG.hero3]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (idx: number) => {
    setAnimating(true)
    window.setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 350)
  }

  useEffect(() => {
    const t = window.setInterval(() => {
      go((current + 1) % SLIDES.length)
    }, 7000)
    return () => window.clearInterval(t)
  }, [current])

  const slide = SLIDES[current]

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden" aria-label="Sorotan">
      {SLIDE_IMAGES.map((img, i) => (
        <div
          key={img}
          aria-hidden="true"
          className={`absolute inset-0 scale-105 bg-cover bg-center transition-all duration-[1200ms] ease-out ${i === current ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      {/* Overlay gradasi: gelap kuat di bawah utk teks + statistik */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/75" aria-hidden="true" />

      <div
        className={`relative z-10 flex h-full flex-col items-center justify-center px-4 pb-24 text-center transition-all duration-500 ${
          animating ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
          🌸 Taman Kanak-Kanak Favorit · Bekasi
        </span>
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
          {slide.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base font-semibold text-white drop-shadow sm:text-xl">
          {slide.subtitle}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-white/85 drop-shadow sm:text-base">
          {slide.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/pendaftaran"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3 font-semibold text-[var(--primary-foreground)] shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl"
          >
            Daftar Sekarang <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/profil"
            className="rounded-full border border-white/60 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label="Slide sebelumnya"
        onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-xl text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Slide berikutnya"
        onClick={() => go((current + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-xl text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30"
      >
        ›
      </button>

      <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ke slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-[var(--primary)]' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Statistik strip — glassmorphism + count-up */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-black/40 backdrop-blur-xl">
        <dl className="mx-auto grid max-w-[1100px] grid-cols-3 divide-x divide-white/10 px-4 py-6 text-center text-white">
          <div>
            <dd className="text-3xl font-bold sm:text-4xl"><CountUp value={120} suffix="+" /></dd>
            <dt className="mt-1 text-xs uppercase tracking-wide opacity-75 sm:text-sm">Siswa Aktif</dt>
          </div>
          <div>
            <dd className="text-3xl font-bold sm:text-4xl"><CountUp value={15} suffix="+" /></dd>
            <dt className="mt-1 text-xs uppercase tracking-wide opacity-75 sm:text-sm">Guru &amp; Staf</dt>
          </div>
          <div>
            <dd className="text-3xl font-bold sm:text-4xl"><CountUp value={8} /></dd>
            <dt className="mt-1 text-xs uppercase tracking-wide opacity-75 sm:text-sm">Program Kegiatan</dt>
          </div>
        </dl>
      </div>
    </section>
  )
}
