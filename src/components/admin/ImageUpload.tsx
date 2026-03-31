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

  async function convertHeicToJpeg(file: File): Promise<Blob> {
    console.log('🔄 Konverterer HEIC til JPEG...')
    
    try {
      const heic2any = (await import('heic2any')).default
      
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      })
      
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
      console.log('✅ HEIC konvertert til JPEG')
      return blob
    } catch (convertError) {
      console.error('❌ HEIC konverteringsfeil:', convertError)
      throw new Error('Kunne ikke konvertere HEIC-bilde. Prøv å ta et nytt bilde.')
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const originalFile = e.target.files?.[0]
    if (!originalFile) return

    setError(null)
    setUploading(true)

    console.log('📸 Fil valgt:', originalFile.name, originalFile.type, originalFile.size)

    try {
      let blob: Blob = originalFile
      let fileName = originalFile.name

      // Sjekk om det er HEIC/HEIF
      const isHeic = originalFile.type === 'image/heic' || 
                     originalFile.type === 'image/heif' ||
                     originalFile.name.toLowerCase().endsWith('.heic') ||
                     originalFile.name.toLowerCase().endsWith('.heif')

      if (isHeic) {
        blob = await convertHeicToJpeg(originalFile)
        fileName = originalFile.name.replace(/\.(heic|heif)$/i, '.jpg')
      }

      // Valider størrelse
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Bildet må være mindre enn 5MB')
      }

      // Vis forhåndsvisning
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(blob)

      // Konverter til base64 for opplasting
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          // Fjern "data:image/jpeg;base64," prefix
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      console.log('🚀 Starter opplasting...')
      const result = await uploadImage({
        base64Data: base64,
        fileName: fileName,
        mimeType: isHeic ? 'image/jpeg' : originalFile.type
      })
      
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
      console.log('🏁 Opplasting fullført')
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
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
        Maks 5MB. iPhone HEIC-bilder konverteres automatisk.
      </small>
    </div>
  )
}