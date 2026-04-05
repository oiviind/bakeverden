'use client'

import { useState } from 'react'
import ImageUpload from '@/components/admin/ImageUpload'
import { Button, Alert } from '@/components/ui'
import { addGalleryImage, deleteGalleryImage } from '@/lib/actions/galleryActions'
import styles from './admin-galleri.module.css'
import type { GalleryImage } from '@/types/database.types'

const CATEGORIES = [
  { value: 'dåp', label: 'Dåp' },
  { value: 'bursdag', label: 'Bursdag' },
  { value: 'bryllup', label: 'Bryllup' },
  { value: 'konfirmasjon', label: 'Konfirmasjon' },
  { value: 'gjærbakst', label: 'Gjærbakst' },
  { value: 'annet', label: 'Annet' },
]

export default function GalleryAdmin({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function handleSave() {
    if (!imageUrl || !category) return
    setSaving(true)
    const result = await addGalleryImage(imageUrl, category)
    if (result.success) {
      const newImage: GalleryImage = {
        id: crypto.randomUUID(),
        image_url: imageUrl,
        category,
        created_at: new Date().toISOString(),
      }
      setImages(prev => [newImage, ...prev])
      setImageUrl(null)
      setCategory('')
      setStatus('success')
    } else {
      setStatus('error')
    }
    setSaving(false)
    setTimeout(() => setStatus('idle'), 3000)
  }

  async function handleDelete(id: string) {
    const result = await deleteGalleryImage(id)
    if (result.success) {
      setImages(prev => prev.filter(img => img.id !== id))
    }
  }

  return (
    <div>
      <div className={styles.uploadSection}>
        <h2 className={styles.uploadTitle}>Last opp bilde</h2>

        <ImageUpload
          onImageUploaded={url => setImageUrl(url)}
          currentImageUrl={imageUrl ?? undefined}
        />

        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select
            className="form-input"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Velg kategori</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {status === 'success' && <Alert variant="success" className="mb-3">Bilde lagret!</Alert>}
        {status === 'error' && <Alert variant="error" className="mb-3">Noe gikk galt. Prøv igjen.</Alert>}

        <Button
          onClick={handleSave}
          disabled={!imageUrl || !category || saving}
          loading={saving}
          fullWidth
        >
          Lagre bilde
        </Button>
      </div>

      <h2 className={styles.uploadTitle}>{images.length} bilder</h2>
      <div className={styles.grid}>
        {images.map(img => (
          <div key={img.id} className={styles.imageWrapper}>
            <img src={img.image_url} alt={img.category} className={styles.thumbnail} />
            <span className={styles.categoryBadge}>{img.category}</span>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(img.id)}
              aria-label="Slett"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
