'use client'

import { useState } from 'react'
import styles from './galleri.module.css'
import type { GalleryImage } from '@/types/database.types'

const CATEGORIES = [
  { value: 'dåp', label: 'Dåp' },
  { value: 'bursdag', label: 'Bursdag' },
  { value: 'bryllup', label: 'Bryllup' },
  { value: 'konfirmasjon', label: 'Konfirmasjon' },
  { value: 'gjærbakst', label: 'Gjærbakst' },
  { value: 'annet', label: 'Annet' },
]

export default function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const filtered = activeTab === 'all' ? images : images.filter(img => img.category === activeTab)

  return (
    <div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Alle
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`${styles.tab} ${activeTab === cat.value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' ? (
        CATEGORIES
          .filter(cat => images.some(img => img.category === cat.value))
          .map(cat => (
            <div key={cat.value} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{cat.label}</h2>
              <div className={styles.scrollRow}>
                {images
                  .filter(img => img.category === cat.value)
                  .map(img => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={cat.label}
                      className={`${styles.scrollImage} ${styles.clickable}`}
                      onClick={() => setLightboxUrl(img.image_url)}
                    />
                  ))}
              </div>
            </div>
          ))
      ) : (
        <div className={styles.grid}>
          {filtered.map(img => (
            <img
              key={img.id}
              src={img.image_url}
              alt={activeTab}
              className={`${styles.gridImage} ${styles.clickable}`}
              onClick={() => setLightboxUrl(img.image_url)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center py-12">Ingen bilder her ennå.</p>
      )}

      {lightboxUrl && (
        <div className={styles.lightbox} onClick={() => setLightboxUrl(null)}>
          <button className={styles.lightboxClose} aria-label="Lukk">✕</button>
          <img
            src={lightboxUrl}
            alt=""
            className={styles.lightboxImage}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
