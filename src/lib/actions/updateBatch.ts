'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

interface UpdateBatchResult {
  success: boolean
  error?: string
}

export async function updateBatch(batchId: string, formData: FormData): Promise<UpdateBatchResult> {
  const supabase = createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const image_url = formData.get('image_url') as string
  const price = Number(formData.get('price'))
  const pickup_start = formData.get('pickup_start') as string
  const pickup_end = formData.get('pickup_end') as string
  const total_quantity = Number(formData.get('total_quantity')) || 999999
  const is_active = formData.get('is_active') === 'on'
  const ingredientIds: string[] = [...new Set<string>(JSON.parse((formData.get('ingredients') as string) || '[]'))]

  if (!title || !price || !pickup_start || !pickup_end) {
    return { success: false, error: 'Vennligst fyll ut alle påkrevde felter' }
  }

  try {
    const { error: batchError } = await supabase
      .from('product_batches')
      .update({ title, description: description || null, image_url: image_url || null, price, pickup_start, pickup_end, total_quantity, is_active })
      .eq('id', batchId)

    if (batchError) return { success: false, error: 'Kunne ikke oppdatere kake: ' + batchError.message }

    // Replace ingredients: delete existing, re-insert
    const { error: deleteError } = await supabase
      .from('batch_ingredients')
      .delete()
      .eq('batch_id', batchId)

    if (deleteError) return { success: false, error: 'Kunne ikke oppdatere ingredienser: ' + deleteError.message }

    if (ingredientIds.length > 0) {
      const { error: insertError } = await supabase
        .from('batch_ingredients')
        .upsert(
          ingredientIds.map(id => ({ batch_id: batchId, ingredient_id: id })),
          { onConflict: 'batch_id,ingredient_id', ignoreDuplicates: true }
        )

      if (insertError) return { success: false, error: 'Kunne ikke legge til ingredienser: ' + insertError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/batches')

    return { success: true }
  } catch (err) {
    return { success: false, error: 'En uventet feil oppstod: ' + String(err) }
  }
}
