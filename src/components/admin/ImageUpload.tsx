'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/actions/uploadImage'
import heic2any from 'heic2any'

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
    const originalFile = e.target.files?.[0]
    if (!originalFile) return

    setError(null)
    setUploading(true)

    console.log('📸 Fil valgt:', originalFile.name, originalFile.type, originalFile.size)

    try {
      let file = originalFile

      // Konverter HEIC/HEIF til JPEG
      if (originalFile.type === 'image/heic' || 
          originalFile.type === 'image/heif' ||
          originalFile.name.toLowerCase().endsWith('.heic') ||
          originalFile.name.toLowerCase().endsWith('.heif')) {
        
        console.log('🔄 Konverterer HEIC til JPEG...')
        
        try {
          const convertedBlob = await heic2any({
            blob: originalFile,
            toType: 'image/jpeg',
            quality: 0.9
          })
          
          // heic2any kan returnere array eller enkelt Blob
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
          
          // Lag ny File fra Blob
          file = new File(
            [blob], 
            originalFile.name.replace(/\.(heic|heif)$/i, '.jpg'),
            { type: 'image/jpeg' }
          )
          
          console.log('✅ HEIC konvertert til JPEG:', file.name, file.size)
        } catch (convertError) {
          console.error('❌ HEIC konverteringsfeil:', convertError)
          throw new Error('Kunne ikke konvertere HEIC-bilde. Prøv å velge et JPEG/PNG-bilde.')
        }
      }

      // Vis forhåndsvisning
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Last opp
      const formData = new FormData()
      formData.append('file', file)

      console.log('🚀 Starter opplasting...')
      const result = await uploadImage(formData)
      console.log('📦 Resultat mottatt:', result)

      if (result.success && result.imageUrl) {
        console.log('✅ Bilde lastet opp:', result.imageUrl)
        onImageUploaded(result.imageUrl)
        setError(null)
      } else {
        console.error('❌ Opplasting feilet:', result.error)
        setError(result.error || 'Opplasting feilet')
        setPreview(null)
      }
    } catch (err) {
      console.error('❌ Uventet feil:', err)
      setError(err instanceof Error ? err.message : 'En uventet feil oppstod')
      setPreview(null)
    } finally {
      setUploading(false)
      console.log('🏁 Opplasting fullført, uploading satt til false')
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
          {uploading ? '⏳ Laster opp...' : '🖼️ Velg fra galleri'}
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          {uploading ? '⏳ Laster opp...' : '📷 Ta bilde'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-2">
          {error}
        </div>
      )}

      <small className="text-gray-500 mt-1 block">
        Maks 5MB. iPhone-bilder (HEIC) konverteres automatisk.
      </small>
    </div>
  )
}