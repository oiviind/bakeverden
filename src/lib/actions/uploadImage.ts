'use server'

import { createClient } from '@/lib/supabase'

interface UploadImageResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  const supabase = createClient()
  
  const file = formData.get('file') as File
  
  if (!file || file.size === 0) {
    return {
      success: false,
      error: 'Ingen fil valgt'
    }
  }

  // Valider filtype
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Kun JPEG, PNG og WebP er tillatt'
    }
  }

  // Valider filstørrelse (maks 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'Bildet må være mindre enn 5MB'
    }
  }

  try {
    // Generer unikt filnavn
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `batches/${fileName}`

    // Last opp til Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('product-images') // Bucket-navn - må opprettes i Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: 'Kunne ikke laste opp bilde: ' + uploadError.message
      }
    }

    // Hent offentlig URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return {
      success: true,
      imageUrl: publicUrl
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod: ' + String(err)
    }
  }
}