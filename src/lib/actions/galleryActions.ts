'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { GalleryImage } from '@/types/database.types'

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export async function addGalleryImage(imageUrl: string, category: string, title?: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('gallery_images')
    .insert({ image_url: imageUrl, category, title: title || null })
  if (error) return { success: false, error: error.message }
  revalidatePath('/galleri')
  revalidatePath('/admin/galleri')
  return { success: true }
}

export async function deleteGalleryImage(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/galleri')
  revalidatePath('/admin/galleri')
  return { success: true }
}
