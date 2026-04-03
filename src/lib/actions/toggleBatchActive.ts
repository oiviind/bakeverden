// src/lib/actions/toggleBatchActive.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ToggleActiveResult {
  success: boolean
  error?: string
}

export async function toggleBatchActive(
  batchId: string,
  isActive: boolean
): Promise<ToggleActiveResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('product_batches')
      .update({ is_active: isActive })
      .eq('id', batchId)

    if (error) {
      console.error('Error toggling batch active:', error)
      return {
        success: false,
        error: 'Kunne ikke oppdatere status'
      }
    }

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/batches')

    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod'
    }
  }
}