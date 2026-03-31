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

  console.log('📤 Mottar fil:', file.name, file.type, file.size)

  // Valider filtype - HEIC konverteres på klientsiden
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png', 
    'image/webp'
  ]
  
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    console.error('❌ Ugyldig filtype:', file.type)
    return {
      success: false,
      error: 'Kun JPEG, PNG og WebP er tillatt (HEIC konverteres automatisk)'
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
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `batches/${fileName}`

    console.log('📂 Laster opp til:', filePath)

    // Last opp til Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return {
        success: false,
        error: 'Kunne ikke laste opp bilde: ' + uploadError.message
      }
    }

    console.log('✅ Fil lastet opp:', data.path)

    // Hent offentlig URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    console.log('🌐 Public URL:', publicUrl)

    return {
      success: true,
      imageUrl: publicUrl
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod: ' + String(err)
    }
  }
}