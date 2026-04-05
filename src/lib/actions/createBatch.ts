'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

interface CreateBatchResult {
  success: boolean
  batch_id?: string
  error?: string
}

export async function createBatch(formData: FormData): Promise<CreateBatchResult> {
  const supabase = createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const image_url = formData.get('image_url') as string
  const price = Number(formData.get('price'))
  const pickup_start = formData.get('pickup_start') as string
  const pickup_end = formData.get('pickup_end') as string
  const total_quantity = Number(formData.get('total_quantity')) || 999999
  const is_active = formData.get('is_active') === 'on'
  const ingredientsJson = formData.get('ingredients') as string
  const ingredientIds = JSON.parse(ingredientsJson || '[]')

  console.log('=== CREATE BATCH START ===')
  console.log('Creating batch:', { title, price, total_quantity, ingredientIds })

  // Validering
  if (!title || !price || !pickup_start || !pickup_end) {
    return {
      success: false,
      error: 'Vennligst fyll ut alle påkrevde felter'
    }
  }

  try {
    // Opprett batch
    const { data: batch, error: batchError } = await supabase
      .from('product_batches')
      .insert({
        title,
        description: description || null,
        image_url: image_url || null,
        price,
        pickup_start,
        pickup_end,
        total_quantity,
        remaining_quantity: total_quantity,
        is_active
      })
      .select()
      .single()

    if (batchError) {
      console.error('Batch error:', batchError)
      return {
        success: false,
        error: 'Kunne ikke opprette kake: ' + batchError.message
      }
    }

    console.log('✅ Batch created:', batch.id)

    // Legg til ingredienser
    if (ingredientIds.length > 0) {
      console.log('Adding ingredients:', ingredientIds)
      
      const batchIngredients = ingredientIds.map((ingredientId: string) => ({
        batch_id: batch.id,
        ingredient_id: ingredientId
      }))

      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('batch_ingredients')
        .insert(batchIngredients)
        .select()

      if (ingredientsError) {
        console.error('❌ Ingredients error:', ingredientsError)
        return {
          success: false,
          error: 'Kaken ble opprettet, men ingredienser feilet: ' + ingredientsError.message
        }
      }

      console.log('✅ Ingredients added:', ingredientsData)
    }

    console.log('=== CREATE BATCH SUCCESS ===')

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/batches')

    return {
      success: true,
      batch_id: batch.id
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod: ' + String(err)
    }
  }
}