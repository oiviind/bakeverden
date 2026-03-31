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
  const cameraInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    console.log('📸 Fil valgt:', file.name, file.type, file.size)

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
      console.log('✅ Bilde lastet opp:', result.imageUrl)
      onImageUploaded(result.imageUrl)
    } else {
      console.error('❌ Opplasting feilet:', result.error)
      setError(result.error || 'Opplasting feilet')
      setPreview(null)
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">Bilde</label>
      
      {preview && (
        <div className="mb-4 relative">
          <img 
            src={preview} 
            alt="Forhåndsvisning" 
            className="w-full h-48 object-cover rounded-lg"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white flex items-center gap-2">
                <span className="spinner"></span>
                <span>Laster opp...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input for bildebibliotek (uten capture) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input for kamera (med capture) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          🖼️ {preview ? 'Endre fra galleri' : 'Velg fra galleri'}
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          📷 Ta bilde
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-2">
          {error}
        </div>
      )}

      <small className="text-gray-500 mt-1 block">
        Maks 5MB. Støtter JPEG, PNG, WebP og HEIC (iPhone).
      </small>
    </div>
  )
}