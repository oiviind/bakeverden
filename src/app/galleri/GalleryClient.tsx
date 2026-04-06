'use client'

import { useState } from 'react'
import styles from './galleri.module.css'
import type { GalleryImage } from '@/types/database.types'

const CATEGORIES = [
  { value: 'dåp', label: 'Dåp' },
  { value: 'bursdag', label: 'Bursdag' },
  { value: 'barnebursdag', label: 'Barnebursdag' },
  { value: 'bryllup', label: 'Bryllup' },
  { value: 'konfirmasjon', label: 'Konfirmasjon' },
  { value: 'gjærbakst', label: 'Gjærbakst' },
  { value: 'annet', label: 'Annet' },
]

const ALL_TABS = [
  { value: 'alle', label: 'Alle' },
  ...CATEGORIES,
]

function ScrollGrid({ images, onOpen }: { images: GalleryImage[]; onOpen: (url: string) => void }) {
  const chunks: GalleryImage[][] = []
  for (let i = 0; i < images.length; i += 4) chunks.push(images.slice(i, i + 4))
  return (
    <div className={styles.scrollContainer}>
      {chunks.map((chunk, ci) => (
        <div key={ci} className={styles.chunkGrid}>
          {chunk.map(img => (
            <div key={img.id} className={styles.imageWrapper}>
              <img src={img.image_url} alt={img.category} className={styles.thumbnail} onClick={() => onOpen(img.image_url)} />
              {img.title && <span className={styles.categoryBadge}>{img.title}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [activeTab, setActiveTab] = useState('alle')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  return (
    <div>
      <div className="flex overflow-x-auto mb-6 border-b border-gray-200 scrollbar-none">
        {ALL_TABS.map(tab => {
          const count = tab.value === 'alle' ? images.length : images.filter(img => img.category === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={[
                'flex-shrink-0 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                activeTab === tab.value
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {activeTab === 'alle' ? (
        CATEGORIES
          .filter(cat => images.some(img => img.category === cat.value))
          .map(cat => (
            <div key={cat.value} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{cat.label}</h2>
              <ScrollGrid images={images.filter(img => img.category === cat.value)} onOpen={setLightboxUrl} />
            </div>
          ))
      ) : (
        (() => {
          const filtered = images.filter(img => img.category === activeTab)
          if (filtered.length === 0) return <p className="text-gray-500 text-center py-12">Ingen bilder her ennå.</p>
          return (
            <div className={styles.verticalGrid}>
              {filtered.map(img => (
                <div key={img.id} className={styles.imageWrapper}>
                  <img src={img.image_url} alt={img.category} className={styles.thumbnail} onClick={() => setLightboxUrl(img.image_url)} />
                  {img.title && <span className={styles.categoryBadge}>{img.title}</span>}
                </div>
              ))}
            </div>
          )
        })()
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
