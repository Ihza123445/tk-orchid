'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/content/public-content'

// Progress bar scroll di atas layar, tombol WhatsApp melayang, dan tombol kembali ke atas.
export function SiteEnhancements({ whatsapp }: { whatsapp: string }) {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      setShowTop(window.scrollY > 700)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="school-scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="school-floating">
        <button
          type="button"
          className={`school-to-top ${showTop ? 'visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
          tabIndex={showTop ? 0 : -1}
        >
          <ArrowUp />
        </button>
        <a className="school-wa" href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp TK Orchid">
          <MessageCircle />
          <span>Tanya via WhatsApp</span>
        </a>
      </div>
    </>
  )
}
