'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Alert } from '@/components/ui'
import { uploadImage } from '@/lib/actions/uploadImage'
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

const ALL_TABS = [
  { value: 'alle', label: 'Alle' },
  ...CATEGORIES,
]

export default function GalleryAdmin({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages)
  const [activeTab, setActiveTab] = useState('alle')
  const [pendingUrls, setPendingUrls] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value = ''
    setUploading(true)

    for (const originalFile of files) {
      try {
        let blob: Blob = originalFile
        let fileName = originalFile.name

        const isHeic = ['image/heic', 'image/heif'].includes(originalFile.type) ||
          /\.(heic|heif)$/i.test(fileName)

        if (isHeic) {
          const heic2any = (await import('heic2any')).default
          const converted = await heic2any({ blob: originalFile, toType: 'image/jpeg', quality: 0.9 })
          blob = Array.isArray(converted) ? converted[0] : converted
          fileName = fileName.replace(/\.(heic|heif)$/i, '.jpg')
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        const result = await uploadImage({
          base64Data: base64,
          fileName,
          mimeType: isHeic ? 'image/jpeg' : originalFile.type,
        })

        if (result.success && result.imageUrl) {
          setPendingUrls(prev => [...prev, result.imageUrl!])
        }
      } catch {
        // skip failed files
      }
    }

    setUploading(false)
  }

  async function handleSave() {
    if (!pendingUrls.length || !category) return
    setSaving(true)
    const newImages: GalleryImage[] = []
    for (const url of pendingUrls) {
      const result = await addGalleryImage(url, category, title || undefined)
      if (result.success) {
        newImages.push({ id: crypto.randomUUID(), image_url: url, category, title: title || undefined, created_at: new Date().toISOString() })
      }
    }
    setImages(prev => [...newImages, ...prev])
    setPendingUrls([])
    setTitle('')
    setCategory('')
    setSaving(false)
    setStatus('success')
    setTimeout(() => setStatus('idle'), 3000)
  }

  async function handleDelete(id: string) {
    const result = await deleteGalleryImage(id)
    if (result.success) setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div>
      <div className={styles.uploadSection}>
        <h2 className={styles.uploadTitle}>Last opp bilder</h2>

        <div className="form-group">
          <label className="form-label">Bilder</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} loading={uploading}>
            {uploading ? '⏳ Laster opp...' : '📷 Velg bilder'}
          </Button>
          <small className="text-gray-500 mt-1 block">Maks 20MB per bilde. HEIC konverteres automatisk.</small>
        </div>

        {pendingUrls.length > 0 && (
          <div className={styles.pendingGrid}>
            {pendingUrls.map((url, i) => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="" className={styles.thumbnail} />
                <button
                  className={styles.deleteButton}
                  onClick={() => setPendingUrls(prev => prev.filter((_, j) => j !== i))}
                  aria-label="Fjern"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Tittel</label>
          <input
            type="text"
            className="form-input"
            placeholder="Valgfri tittel"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Velg kategori</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {status === 'success' && <Alert variant="success" className="mb-3">Bilder lagret!</Alert>}
        {status === 'error' && <Alert variant="error" className="mb-3">Noe gikk galt. Prøv igjen.</Alert>}

        <Button onClick={handleSave} disabled={!pendingUrls.length || !category || saving} loading={saving} fullWidth>
          Lagre {pendingUrls.length > 1 ? `${pendingUrls.length} bilder` : 'bilde'}
        </Button>
      </div>

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

      {(() => {
        const visible = activeTab === 'alle' ? images : images.filter(img => img.category === activeTab)
        if (visible.length === 0) return <p className="text-gray-500 text-center py-8">Ingen bilder her ennå.</p>
        const chunks: GalleryImage[][] = []
        for (let i = 0; i < visible.length; i += 6) chunks.push(visible.slice(i, i + 6))
        return (
          <div className={styles.scrollContainer}>
            {chunks.map((chunk, ci) => (
              <div key={ci} className={styles.grid}>
                {chunk.map(img => (
                  <div key={img.id} className={styles.imageWrapper}>
                    <img src={img.image_url} alt={img.category} className={styles.thumbnail} onClick={() => setLightboxUrl(img.image_url)} />
                    {img.title && <span className={styles.categoryBadge}>{img.title}</span>}
                    <button className={styles.deleteButton} onClick={() => setConfirmDeleteId(img.id)} aria-label="Slett">✕</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })()}

      {confirmDeleteId && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Slett bilde</h3>
            <p className="text-gray-600 mb-6">Er du sikker på at du vil slette dette bildet?</p>
            <div className="flex gap-3">
              <Button variant="danger" fullWidth onClick={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}>Ja</Button>
              <Button variant="secondary" fullWidth onClick={() => setConfirmDeleteId(null)}>Avbryt</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {lightboxUrl && (
        <div className={styles.lightbox} onClick={() => setLightboxUrl(null)}>
          <button className={styles.lightboxClose} aria-label="Lukk">✕</button>
          <img src={lightboxUrl} alt="" className={styles.lightboxImage} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
