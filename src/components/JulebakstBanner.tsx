'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from '@/app/page.module.css'
import { getButtonClassName } from '@/components/ui'

const FLAKES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 2) % 100}%`,
  delay: `${(i * 0.4) % 4}s`,
  duration: `${4 + (i % 4)}s`,
  size: i % 3 === 0 ? '1.2rem' : '0.7rem',
  opacity: 0.4 + (i % 3) * 0.15,
}))

export default function JulebakstBanner() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={styles.julebakst}>
      {/* Snow */}
      <div aria-hidden className={styles.snow}>
        {FLAKES.map(f => (
          <span
            key={f.id}
            className={styles.flake}
            style={{ left: f.left, animationDelay: f.delay, animationDuration: f.duration, fontSize: f.size, opacity: f.opacity }}
          >
            ❄
          </span>
        ))}
      </div>

      {/* Content */}
      <div className={`container ${styles.julebakstContent} ${visible ? styles.visible : ''}`}>
        <h2 className={styles.julebakstTitle}>Julebaksten er i gang 🎄</h2>
        <p className={styles.julebakstText}>
          Bestill i god tid før jul!
        </p>
        <Link href="/julebakst" className={getButtonClassName('secondary', 'lg')}>
          Se årets utvalg
        </Link>
      </div>
    </section>
  )
}
