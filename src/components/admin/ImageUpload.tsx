'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/actions/uploadImage'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
}

export default function ImageUpload({ onImageUploaded, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    // Vis forhåndsvisning
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Last opp
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)

    setUploading(false)

    if (result.success && result.imageUrl) {
      onImageUploaded(result.imageUrl)
    } else {
      setError(result.error || 'Opplasting feilet')
      setPreview(null)
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">Bilde</label>
      
      {preview && (
        <div className="mb-4">
          <img 
            src={preview} 
            alt="Forhåndsvisning" 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="spinner"></span>
              Laster opp...
            </span>
          ) : (
            <>
              📷 {preview ? 'Endre bilde' : 'Velg bilde'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-2">
          {error}
        </div>
      )}

      <small className="text-gray-500 mt-1 block">
        Maks 5MB. Støtter JPEG, PNG og WebP.
      </small>
    </div>
  )
}