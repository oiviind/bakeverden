'use server'

import { createClient } from '@/lib/supabase'

interface UploadImageResult {
  success: boolean
  imageUrl?: string
  error?: string
}

interface UploadImageParams {
  base64Data: string
  fileName: string
  mimeType: string
}

export async function uploadImage(params: UploadImageParams): Promise<UploadImageResult> {
  const { base64Data, fileName, mimeType } = params
  const supabase = createClient()
  
  console.log('📤 Mottar fil:', fileName, mimeType, 'size:', base64Data.length)

  // Valider filtype
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(mimeType.toLowerCase())) {
    console.error('❌ Ugyldig filtype:', mimeType)
    return {
      success: false,
      error: 'Kun JPEG, PNG og WebP er tillatt'
    }
  }

  try {
    // Konverter base64 til Buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Valider størrelse - ØKT TIL 20MB
    if (buffer.length > 20 * 1024 * 1024) {
      return {
        success: false,
        error: 'Bildet må være mindre enn 10MB'
      }
    }

    // Generer unikt filnavn
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `batches/${uniqueFileName}`

    console.log('📂 Laster opp til:', filePath)

    // Last opp til Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
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